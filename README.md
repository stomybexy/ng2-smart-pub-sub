# Ng2-Smart-Pub-Sub

Not yet published on atmosphere...

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

for example on `pubs/parties`
```ts
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

and then on client. The package defines a module `ng2-smart-sub` that exports a class `SmartMeteorComponent`. Extends that class and use `this.smartSubscribe`

````ts
    ....
    import {SmartMeteorComponent} from 'ng2-smart-sub';

    @Component({
      selector: 'parties-list'
    })
    @View({
      templateUrl: '/client/parties-list/parties-list.html'
    })
    class PartiesList {
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

```ts
  import 'pubs/parties'
```
By default `smartSubscribe` will initialize a property of the same name as the publication name, `parties` in the example. To change that, just pass a object like this: 

```ts

  ....
  myParties: Mongo.Cursor<Party>; //You don't even have to write this line but it makes things clear.
  ....
    this.smartSubscribe({pubName: 'parties', varName:'myParties')
  ....
```

### Reactive joins

Thanks to [reywood:publish-composite](https://atmospherejs.com/reywood/publish-composite), you can publish related data.

For example to publish parties with their owners reactively:

```ts
  SmartPub.smartPublishComposite('parties', {
    find: function() {
        return {
            selector: {}, // This is optional. it is {} by default
            sort: {name: 1},
            coll: Parties

        }
    },
    children: [{
        find: function(party) {
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
You subscribe to this publication as before and `parties` property of your `Parties-List` component will be a cursor that holds a collection of Parties, each containing a creator property which is a user object from the collection `Meteor.users`, all of this,  reactively.
