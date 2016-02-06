import {Parties} from 'collections/parties';

Meteor.publish('uninvited', function(partyId: string) {
    let party = Parties.findOne(partyId);

    if (!party)
        throw new Meteor.Error('404', 'No such party!');

    return Meteor.users.find({
        _id: {
            $nin: party.invited || [],
            $ne: this.userId
        }
    });
});
