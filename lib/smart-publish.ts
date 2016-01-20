
export function smartPublish(name: string, pubFunc: Function) {
    if (Meteor.isServer) {
        Meteor.publish(name, function() {
            var self = this;
            var args = Array.prototype.slice.apply(arguments);

            var opt = pubFunc.apply(this, args);

            var cursor = opt.coll.find(opt.selector || {}, {
                sort: opt.sort,
                skip: opt.skip,
                limit: opt.limit,
                fields: opt.fields,
                transform: opt.transform
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
        opt.test = (function() { return 10 }).toString();
        return opt;
    }

    Meteor.methods(meth);

};

export function smartPublishComposite(name: string, pub: any) {
    if (Meteor.isServer) {
        if (_.isObject(pub)) {
            Meteor.publishComposite(name, mapToCursor(pub));
        } else {
            if (_.isFunction(pub)) {
                Meteor.publishComposite(name, (...args) => {
                    return mapToCursor(pub(...args));
                })
            } else {
                throw new Meteor.Error('argument pub must be an object or a function');
            }
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

function mapToCursor(pub: Object) {
    return {
        find: (...args) => {

            var opt = pub.find(...args);
            var cursor = opt.coll.find(opt.selector || {}, {
                sort: opt.sort,
                skip: opt.skip,
                limit: opt.limit,
                fields: opt.fields
            });
            return cursor;
        },
        children: _.map(pub.children, (child) => {
            return mapToCursor(child);
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
