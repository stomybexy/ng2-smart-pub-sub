describe('ng2 smart pub', function () {
    var SmartPub;
    var TestCollection;
    beforeAll(function (done) {
        TestCollection = new Mongo.Collection('testCollection');
        System.import('ng2-smart-pub').then(function (obj) {
            SmartPub = obj.SmartPub;
            done();
        })

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
        it('should call Meteor.methods', function () {
            expect(Meteor.methods).toHaveBeenCalled();
        })

        it('should call Meteor.methods with the right arguments', function () {
            expect(Meteor.methods).toHaveBeenCalledWith(jasmine.objectContaining({
                testpub: jasmine.any(Function)
            }));
        })

    });

    describe('smartPublish should define a method that return the published cursor specs', function () {
        beforeAll(function () {
            SmartPub.smartPublish('testpub1', function () {
                var selector = {
                    _id: {
                        $in: [1, 2, 3]
                    }
                }
                return {
                    selector: selector,
                    coll: TestCollection
                }
            });
        })
        it('should return the right collection name', function (done) {

            Meteor.call('testpub1', function (err, res) {
                console.log(err, res);
                expect(res.collName).toBe('testCollection');
                done()
            });


        })
        it('should return the right selector', function (done) {
            var selector = {
                _id: {
                    $in: [1, 2, 3]
                }
            }
            Meteor.call('testpub1', function (err, res) {
                console.log(err, res);
                expect(_.isEqual(res.selector, selector)).toBe(true);
                done()
            });

        })

    })

});