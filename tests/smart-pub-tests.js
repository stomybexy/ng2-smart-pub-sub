describe('ng2 smart pub', function () {
    var SmartPub;
    var Testcollection;
    beforeAll(function (done) {
        System.import('ng2-smart-pub').then(function (obj) {
            SmartPub = obj.SmartPub;
            done();
        })
        Testcollection = new Mongo.Collection('testCollection');
    })
    it('should be defined', function () {
        expect(SmartPub).toBeDefined();

    })
    it('smartPublish should be defined', function () {
        expect(_.isFunction(SmartPub.smartPublish)).toBe(true);
    })

    it('smartPublishComposite should be defined', function () {
        expect(_.isFunction(SmartPub.smartPublishComposite)).toBe(true);

    })

    describe('smartPublish', function () {
        beforeEach(function () {
            if (Meteor.isServer) {
                spyOn(Meteor, 'publish');
            }
            spyOn(Meteor, 'methods');
            SmartPub.smartPublish('testpub', function () {
                return {
                    coll: TestCollection
                }
            })
        })
        it('should call Meteor.publish', function () {
           
            if (Meteor.isServer) {
                expect(Meteor.publish).toHaveBeenCalled();
            }
        })
        
        it('should call Meteor.publish with the right arguments', function () {

            if (Meteor.isServer) {
                expect(Meteor.publish).toHaveBeenCalledWith('testpub', jasmine.any(Function));
            }
            
        })
        it('should call Meteor.methods', function(){
            expect(Meteor.methods).toHaveBeenCalled();
        })
        
        it('should call Meteor.methods with the right arguments', function(){
            expect(Meteor.methods).toHaveBeenCalledWith(jasmine.objectContaining({
                testpub: jasmine.any(Function)
            }));
        })
    })
})