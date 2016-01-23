/// <reference path="../typings/tsd.d.ts" />

import {MeteorComponent} from 'angular2-meteor';


export class SmartMeteorComponent extends MeteorComponent {
    constructor() {
        super();
    }

    smartSubscribe(name: string | Object, ...rest): Meteor.SubscriptionHandle {
        var pub = name;
        if (!_.isObject(pub)) {
            pub = {
                name: name,
                varName: name
            }
        }

        pub.varName = pub.varName || pub.name;
        return this.subscribe.call(this, pub.name, ...rest, () => {
            var self = this;            
            this.call( pub.name, ...rest, (err, opt) => {

                if (!opt || !opt.collName) {
                    return;
                }
                // console.log(opt)

                if (opt.single) {
                    this._zone.run(() => {
                        this[pub.varName] = Mongo.Collection.get(opt.collName).findOne(opt.selector || {}, {
                            sort: opt.sort,
                            // skip: opt.skip,
                            // limit: opt.limit,
                            fields: opt.fields,
                            transform: (doc) => {
                                if (opt.transform) {
                                    doc = opt.transform(doc);
                                }
                                _.each(opt.children, (child) => {
                                    // this._zone.run(() => {
                                    this.attachChild(doc, child, pub.name, doc, ...rest);
                                    // });
                                });
                                return doc;
                            }
                        });
                    })

                    // console.log(this[name]);
                } else {
                    this._zone.run(() => {
                        this[pub.varName] = Mongo.Collection.get(opt.collName).find(opt.selector || {}, {
                            sort: opt.sort,
                            // skip: opt.skip,
                            // limit: opt.limit,
                            fields: opt.fields,
                            transform: (doc) => {
                                if (opt.transform) {
                                    doc = opt.transform(doc);
                                }
                                _.each(opt.children, (child) => {
                                    // this._zone.run(() => {
                                    this.attachChild(doc, child, pub.name, doc, ...rest);
                                    // });
                                });
                                // doc.creator = Meteor.users.findOne(doc.owner);
                                return doc;
                            }
                        });
                    })

                    // console.log(this[pub.varName]);

                }
            });

        }, true);


    }
    smartPageSubscribe(name: string | Object, options: Object = {}, ...rest) {
        // console.log(options)
        this.autorun(() => {
            options = options || {};
            options.limit = this[options.pageSizeProp || 'pageSize'];
            options.skip = (this[options.curPageProp || 'curPage'].get() - 1) * this[options.pageSizeProp || 'pageSize'];
            options.sort = this[options.sortProp || 'sort'].get();


            this.smartSubscribe(name, options, ...rest);

        });
    }

    attachChild(obj, name, parentName, ...args) {
        parentName = parentName ? parentName + '.' : '';
        name = parentName + name;
        console.log('attaching child', name);
        var opt = Meteor.apply(name, args, { returnStubValue: true });
        // console.log('Stub value', res)
        // this.call.call(this, name, ...args, (err, opt) => {
        // console.log(opt)
        if (opt.single) {
            // setTimeout(() => {
            this._zone.run(() => {
                obj[opt.name] = Mongo.Collection.get(opt.collName).findOne(opt.selector || {}, {
                    sort: opt.sort,
                    // skip: opt.skip,
                    // limit: opt.limit,
                    fields: opt.fields,
                    transform: (doc) => {
                        if (opt.transform) {
                            doc = opt.transform(doc);
                        }
                        _.each(opt.children, (child) => {
                            // this._zone.run(() => { 
                            this.attachChild(doc, child, name, doc, ...args); 
                            // })
                        });
                        return doc;
                    }
                })
                console.log('after attach', obj);
            })
            // }, 10000);

        } else {
            this._zone.run(() => {
                obj[opt.name] = Mongo.Collection.get(opt.collName).find(opt.selector || {}, {
                    sort: opt.sort,
                    // skip: opt.skip,
                    // limit: opt.limit,
                    fields: opt.fields,
                    transform: (doc) => {
                        if (opt.transform) {
                            doc = opt.transform(doc);
                        }
                        _.each(opt.children, (child) => {
                            // this._zone.run(() => { 
                            this.attachChild(doc, child, name, doc, ...args); 
                            // })
                        });
                        return doc;
                    }
                })
            })
        }
        // });
    }

}

