
export var SmartPub = {
    smartPublish: smartPublish,
    smartPublishComposite: smartPublishComposite
}
function smartPublish(name: string, pubFunc: Function) {
    if (Meteor.isServer) {
        Meteor.publish(name, function() {
            var self = this;
            var args = Array.prototype.slice.apply(arguments);

            var opt = pubFunc.apply(this, args);

            var cursor = opt.coll.find(opt.selector || {}, {
                sort: opt.sort,
                skip: opt.skip,
                limit: opt.limit,
                fields: opt.fields
            // , transform: opt.transform
            });

            return cursor;

        });
    }
    var meth = {};
    meth[name] = function() {
        var args = Array.prototype.slice.apply(arguments);
        var opt = pubFunc.apply(this, args);
        // delete opt.skip;
        // delete opt.limit;
        opt.collName = opt.coll._name;
        delete opt.coll;
        return opt;
    }

    Meteor.methods(meth);

};
function smartPublishComposite(name: string, pub: any) {
    if (Meteor.isServer) {
        if (_.isObject(pub)) {
            Meteor.publishComposite(name, function(...subArgs) {
                return mapToCursor.call(this, pub, ...subArgs);
            });
        } else {

            throw new Meteor.Error('argument pub must be an object or a function');

        }
    }

    var meth = {};
    if (_.isObject(pub)) {
        pub.name = name; //Force the top level method name to match the publication name
        createCompositeMethod(pub, null, meth);
    } else {
        if (_.isFunction(pub)) {

        } else {
            throw new Meteor.Error('argument pub must be an object or a function');
        }
    }
    Meteor.methods(meth);
}

function mapToCursor(pub: Object, ...subArgs) {
    var self = this;

    return {
        find: function(...args) {

            var opt = pub.find.call(self, ...args, ...subArgs);
            var cursor = opt.coll.find(opt.selector || {}, {
                sort: opt.sort,
                skip: opt.skip,
                limit: opt.limit,
                fields: opt.fields
            });
            return cursor;
        },
        children: _.map(pub.children, function(child) {

            return mapToCursor.call(self, child, ...subArgs);
        })
    }
}



function createCompositeMethod(pub: Object, parentName, meth) {
    parentName = parentName ? parentName + '.' : '';
    var name = parentName + pub.name;
    // console.log(pub)
    meth[name] = (...args) => {
        var opt = pub.find(...args);
        opt.collName = opt.coll._name;
        delete opt.coll;
        opt.name = pub.name;
        opt.children = _.map(pub.children, (child) => { return child.name });
        return opt;
    }
    _.each(pub.children, (child) => {
        createCompositeMethod(child, name, meth);
    });
}
