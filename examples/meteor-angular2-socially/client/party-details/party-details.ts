import {Component, View} from 'angular2/core';

import {RouteParams} from 'angular2/router';

import {Parties} from 'collections/parties';

import {RouterLink} from 'angular2/router';

import {RequireUser, InjectUser} from 'meteor-accounts';

import {MeteorComponent} from 'angular2-meteor';

import {DisplayName} from 'client/lib/pipes';

import {ANGULAR2_GOOGLE_MAPS_DIRECTIVES, MapMouseEvent} from 'ng2-google-maps/core';

@Component({
    selector: 'party-details'
})
@View({
    pipes: [DisplayName],
    templateUrl: '/client/party-details/party-details.html',
    directives: [RouterLink, ANGULAR2_GOOGLE_MAPS_DIRECTIVES]
})
@RequireUser()
@InjectUser()
export class PartyDetails extends MeteorComponent {
    party: Party;
    users: Mongo.Cursor<Object>;
    user: Meteor.User;

    // Default center Palo Alto coordinates.
    centerLat: Number = 37.4292; 
    centerLng: Number = -122.1381;

    constructor(params: RouteParams) {
        super();
        var partyId = params.get('partyId');
        this.subscribe('party', partyId, () => {
            this.autorun(() => {
                this.party = Parties.findOne(partyId);
                this.getUsers(this.party);
            },   true);
        });

        this.subscribe('uninvited', partyId, () => {
            this.getUsers(this.party);
        }, true);
    }

    getUsers(party: Party) {
        if (party) {
            this.users = Meteor.users.find({
                _id: {
                    $nin: party.invited || [],
                    $ne: Meteor.userId()
                }
            });
        }
    }

    saveParty(party) {
      if (Meteor.userId()) {
        Parties.update(party._id, {
          $set: {
            name: party.name,
            description: party.description,
            location: party.location
          }
        });
      } else {
        alert('Please log in to change this party');
      }
    }

    invite(user: Meteor.User) {
      this.call('invite', this.party._id, user._id, (error) => {
        if (error) {
          alert(`Failed to invite due to ${error}`);
          return;
        }

        alert('User successfully invited.');
      });
    }

    reply(rsvp: string) {
      this.call('reply', this.party._id, rsvp, (error) => {
        if (error) {
          alert(`Failed to reply due to ${error}`);
        }
        else {
          alert('You successfully replied.');
        }
      });
    }

    get isOwner(): boolean {
        if (this.party && this.user) {
            return this.user._id === this.party.owner;
        }

        return false;
    }

    get isPublic(): boolean {
        if (this.party) {
            return this.party.public;
        }

        return false;
    }

    get isInvited(): boolean {
        if (this.party && this.user) {
            let invited = this.party.invited || [];
            return invited.indexOf(this.user._id) !== -1;
        }

        return false;
    }

    get lat(): Number {
        return this.party && this.party.location.lat;
    }

    get lng(): Number {
        return this.party && this.party.location.lng;
    }

    mapClicked($event: MapMouseEvent) {
        this.party.location.lat = $event.coords.lat;
        this.party.location.lng = $event.coords.lng;
    }
}
