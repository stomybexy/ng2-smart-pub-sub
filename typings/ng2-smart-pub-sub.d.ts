/// <reference path="meteor/meteor.d.ts" />
/// <reference path="angular2-meteor.d.ts" />


declare module 'ng2-smart-pub' {
    function smartPublishComposite(name: string, pub: any): any;

    function smartPublish(name: string, pubFunc: Function): any;

}

declare module 'ng2-smart-sub' {
    export class SmartMeteorComponent extends MeteorComponent {



        constructor();

        smartSubscribe(name: string | Object, ...rest): Meteor.SubscriptionHandle;

        smartPageSubscribe(name: string | Object, options, ...rest): any;

        attachChild(obj, name, parentName, ...args): any;

        autorun(runFunc: Function, autoBind?: boolean): Tracker.Computation;
        call(name: string, ...rest: any[]);

    }

}