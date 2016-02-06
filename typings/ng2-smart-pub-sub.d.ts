/// <reference path="meteor/meteor.d.ts" />
/// <reference path="angular2-meteor.d.ts" />


declare module 'ng2-smart-pub' {

    interface SmartPubInterface {
        smartPublishComposite(name: string, pub: Object): any;
        smartPublish(name: string, pubFunc: Function): any;
        isPublish(this_arg: any): boolean;
    }

    export var SmartPub: SmartPubInterface;

}

declare module 'ng2-smart-sub' {
    export class SmartMeteorComponent extends MeteorComponent {

        constructor();

        smartSubscribe(name: string | Object, ...rest): Meteor.SubscriptionHandle;

        smartPageSubscribe(name: string | Object, options?: Object, ...rest): any;

        attachChild(obj, name, parentName, ...args): any;

        autorun(runFunc: Function, autoBind?: boolean): Tracker.Computation;
        call(name: string, ...rest: any[]);

    }

}