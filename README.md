# Ng2-Smart-Pub-Sub


Publish and subscribe to data sets without rewriting queries on client with [angular2-meteor](https://atmospherejs.com/urigo/angular2-meteor). Support reactive joins on server and client.
Don't Repeat yourself.

Meteor publish and subscribe require rewriting queries on client. This package do it for you in angular2-meteor and you just have to publish and then subscribe. 

## Quick start

### Install package:
````
    meteor add jonatan:ng2-smart-pub-sub
````
### Publish your data

This package defines a module `ng2-smart-pub` that exports an object `SmartPub` containing tow methods: 
* smartPublish 
* smartPublishComposite

You need to load files containing publications on client and server and instead of returning cursor from publish function, you return an object defining your cursor.

for example on `pubs/parties.ts`
```js
  import {SmartPub} from 'ng2-smart-pub';
  import {Parties} from 'collections/parties';
  
  SmartPub.smartPublish('parties', function() {
   
    return {
        selector: {},
        sort: {name: 1},
        coll: Parties
    };
});
  
```

### Subscription

On client, the package defines a module `ng2-smart-sub` that exports a class `SmartMeteorComponent`. Extends that class and use `this.smartSubscribe`. This class extends `MeteorComponent` of angular2-meteor, so all the features of `MeteorComponent` are available in `SmartMeteorComponent`

```js
    ....
    import {SmartMeteorComponent} from 'ng2-smart-sub';

    @Component({
      selector: 'parties-list'
    })
    @View({
      templateUrl: '/client/parties-list/parties-list.html'
    })
    class PartiesList extends SmartMeteorComponent{
        parties: Mongo.Cursor<Party>;
        constructor() {
          this.smartSubscribe('parties');
        }
    }

    ....
````
property `parties` will be the cursor you defined on publication including the sort specification `{name: 1}`.
Don't forget to import your publication on client and server.
For example on `server/main.ts` and `client/app.ts`

```js
  import 'pubs/parties'
```
By default `smartSubscribe` will initialize a property of the same name as the publication name, `parties` in the example. To change that, just pass a object like this: 

```js

  ....
  myParties: Mongo.Cursor<Party>; //You don't even have to write this line but it makes things clear.
  ....
    this.smartSubscribe({pubName: 'parties', varName:'myParties')
  ....
```

### Reactive joins

Thanks to [reywood:publish-composite](https://atmospherejs.com/reywood/publish-composite), you can publish related data.

For example to publish parties with their owners reactively:

```js
  SmartPub.smartPublishComposite('parties', {
    find: function(...args) { //You can have subscription arguments. This differs from the way you use arguments on publish-composite package
        return {
            selector: {}, // This is optional. it is {} by default
            sort: {name: 1},
            coll: Parties

        }
    },
    children: [{
        find: function(party, ...args) { // Your subscription arguments follow the parent object (s).
            return {
                selector: {
                    _id: party.owner // The user id of the party's owner
                },
                coll: Meteor.users,
                single: true // To specify n-1 dependency 
            }
        },
        name: 'creator' // This is mandatory. Each party in the parties cursor on client will have a creator property. It will be an object because of single: true, otherwise, it would be a  cursor.
    }]
});
```
You subscribe to this publication as before (`this.smartSubscribe('parties')`) and `parties` property of your `Parties-List` component will be a cursor that holds a collection of Parties, each containing a creator property which is a user object from the collection `Meteor.users`, all of this,  reactively.

### Pagination

#### Publication

This example uses [publish-counts](https://atmospherejs.com/tmeasday/publish-counts) package.

```js
smartPublish('parties', function(options) { // options contains properties sort, skip and limit for pagination
    if (Meteor.isServer && _.isFunction(this.added)) {  //Since the function is executed on server and client you need to do this.
        var self = this;
        Counts.publish(this, 'numberOfParties',
            Parties.find({}), { noReady: true }); // Counts is from publish-counts package.
    }
    
    return {
        sort: options.sort,
        skip: options.skip,
        limit: options.limit,
        fields: options.fields, //You can use fields option from Collection.find(selector, options) API.
        coll: Parties,
        single: false //Not mandatory. false by default. Indicate that you want a cursor on client and not a single doc.
    };
});
```
### Page subscription

The `SmartMeteorComponent` contains a `smartPageSubscribe` that simplifiy subscription to paginated publications.
For example to subscribe to the above publised data,:

```js
    import {SmartMeteorComponent} from 'ng2-smart-sub'; //Import the component
    
    ...
    
    export class PartiesList extends SmartMeteorComponent { //Extends SmartMeteorComponent
        //Defined your properties
        parties: Mongo.Cursor<Party>; //This will hold the paginated data
        pageSize: number = 10; // This is the number of objects by page
        curPage: ReactiveVar<number> = new ReactiveVar<number>(1); // The current page - this has to be a ReactiveVar
        sort: ReactiveVar<Object> = new ReactiveVar<Object>({ //The sort specifier - It has to be a ReactiveVar
            name: 1
        });
        partiesSize: number = 0; // This will hold the total number of parties from publish-counts. This is used in UI.
        
        constructor() {
            super();
            this.smartPageSubscribe('parties');  //This is all to do to make it works reactively.
        }
        
        //To update the total number of parties reactively
        this.autorun(() => { 
            this.partiesSize = Counts.get('numberOfParties'); // Refer to publish-counts package
        }, true);
        
    }
    
    onPageChanged(page: number) {
        this.curPage.set(page);
    }
```
To change page, just call onPageChanged from UI or code with the page number you want. You can even change the sort specifier reactively since it is a ReactiveVar.

This works because of some conventions: 
* By default the property `parties` match the name of your publication, but you can change it as before. 
* The size of a page, the current page and the sort specfier are supposed to be `pageSize`, `curPage` and `sort` by default. You can change this by giving as second argument to `smartPageSubscribe` an object like this:
 
    ```js
    
        {
            pageSizeProp: 'myPageSize', //The name of the property that hold the size of a page. It is not a ReactiveVar
            curPageProp: 'myCurPage', // The name of the property that hold the current page. It has to be a ReactiveVar
            sortProp: 'mySort' // The name of the property that hold the sort specifier. It has to be a ReactiveVar
        }
        
    ```
    None is mandatory. If you don't specify a property, the default is assumed.
    
If you want to use more arguments for your publication, Be sure to have the first argument be an object holding the pagination options. For example, you can do this:

```js
    
    this.smartPageSubscribe('parties', null, this.location); // Null is  for pagination options. The default properties names are used in this case.
    
```

## API

#### SmartPub.smartPublish

```js
    SmartPub.smartPublish(name: string, pubFunc: Function) : Object
```
The returned Object has the following structure:

```js
    {
        selector?: Object, // A Meteor Mongo selector object.
        sort?: Object, // Meteor mongo sort specifier
        skip?: Number, // skip option in Meteor Collection.find API
        limit?: Number, limit option in Meteor Collection.find API
        fields?: Object, // Meteor mongo fields specifier
        
    }
```

#### SmartPub.smartPublishComposite

```js
    SmartPub.smartPublishComposite(name: string, pub: Object)
```
The `pub` argument has the following structure : 

```js
    {
    find: function(...args) { // args are your subscription arguments
        // Must return an Object with the same structure as SmartPub.smartPublish described above.
    },
    children: [
        {
            find: function(topLevelDocument, ...args) { // args are your subscription arguments
                // Called for each top level document. Top level document is passed
                // in as an argument.
                //  Must return an Object with the same structure as SmartPub.smartPublish described above.
            },
            children: [
                {
                    find: function(secondTierDocument, topLevelDocument, ...args) { // args are your subscription arguments
                        // Called for each second tier document. These find functions
                        // will receive all parent documents starting with the nearest
                        // parent and working all the way up to the top level as
                        // arguments.
                        // Must return an Object with the same structure as SmartPub.smartPublish described above.
                    },
                    children: [
                       // Repeat as many levels deep as you like
                    ]
                }
            ]
        },
        {
            find: function(topLevelDocument, ...args) { // args are your subscription arguments
                // Also called for each top level document.
                // Must return an Object with the same structure as SmartPub.smartPublish described above.
            }
            // The children property is optional at every level.
        }
    ]
}
```

#### SmartMeteorComponent.smartSubscribe

```js
    smartSubscribe(name: string | Object, ...rest): Meteor.SubscriptionHandle;
```
* `name` : Name of your publication or an object like 

    ```js
    
        {
            pubName: 'myPubName', // Your publication name
            varName: 'myVarName' // The property that will hold the subscribed data. Optional. By default, puName eq varName eq name
        }
        
    ```
* `rest` : Your subscription arguments.

#### SmartMeteorComponent.smartPageSubscribe 

```js
    smartPageSubscribe(name: string | Object, options?: Object , ...rest)
```

* `name`: same as `smartSubscribe`
* `options`: an object with the following structure:
    

 ```js
    
        {
            pageSizeProp: 'myPageSize', //The name of the property that hold the size of a page. It is not a ReactiveVar
            curPageProp: 'myCurPage', // The name of the property that hold the current page. It has to be a ReactiveVar
            sortProp: 'mySort' // The name of the property that hold the sort specifier. It has to be a ReactiveVar
        }
        
    ```
    
* `rest` : Same as `smartSubscribe`
