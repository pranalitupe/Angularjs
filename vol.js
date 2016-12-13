"use strict";
angular.module('app', ['dataGrid', 'pagination', 'ngMaterial'])
    .controller('EventController', ['$scope', 'ngoEventService', 'CommonService', function ($scope, ngoEventService, CommonService) {
        var eventActivityDetails = {};
        var querystring;
        var nonEmptyVoluteers = [];

        $scope.allApproved = false;
        $scope.sameCauseVol = false;
        $scope.sameSkillVol = false;
        $scope.selfRegistered = false;
        $scope.selfRegisteredParent = false;
        $scope.allSkills;
        $scope.globalData = {}
        $scope.gridOptions = {
            data: [],
            urlSync: false
        };

        $scope.causeName = '';

        ngoEventService.getEventActivityDetails().then(function (response) {
            $scope.globalData.causes = {};
            $scope.globalData.skilledVolunteers = [];
            eventActivityDetails = response.data;
            console.log("eventActivityDetails" + eventActivityDetails["_new_cause_value@OData.Community.Display.V1.FormattedValue"]);
            var cause = eventActivityDetails["_new_cause_value@OData.Community.Display.V1.FormattedValue"];
            $scope.causeName = cause;
            $scope.globalData.event = eventActivityDetails;
            ngoEventService.getSkillSet().then(function (skillsetResponse) {  
                $scope.globalData.skills = skillsetResponse.data.value;
                $scope.getAllVolunteers();
            });
        });

        $scope.getAllVolunteers = function () {
            var querystring = "$filter=statecode eq 0";
            ngoEventService.getEmptyVolunteers(querystring).then(function (allVolunteers) {
                $scope.globalData.allVolunteers = allVolunteers.data.value;
                $scope.appendVolunteersToTable($scope.globalData.allVolunteers);
                $scope.getApprovedVolunteers();
            });
        };

        $scope.getApprovedVolunteers = function () {
            $scope.globalData.allApproved_Vol = [];
            _.forEach($scope.globalData.allVolunteers, function (volunteer) {
                if (volunteer.statuscode === 100000000) {
                    $scope.globalData.allApproved_Vol.push(volunteer);
                }
            });
            $scope.getvolunteersByCause();
        }

        $scope.getvolunteersByCause = function () {
            var causeId = $scope.globalData.event._new_cause_value;
            $scope.cause = $scope.globalData.event._new_cause_value;
            ngoEventService.getvolunteerByCause(causeId).then(function (causedVolunteer) { 
                $scope.globalData.causes.volunteers = [];
                $scope.globalData.causes.volunteers = causedVolunteer.data.value;             
                $scope.globalData.SameCauseVolArray = [];
                for (var volunteer = 0; volunteer < $scope.globalData.causes.volunteers.length; volunteer++) {
                    $scope.globalData.SameCauseVolArray.push($scope.globalData.causes.volunteers[volunteer].new_volunteerid);
                }
            });
        };



        $scope.displayApproved = function (approveStatus, isCauseSelected, skillSetID, isSkillSelected) {
            this.selfRegistered = false;
            if (approveStatus) {

                if (isCauseSelected && !isSkillSelected) {
                    $scope.getCauseVolunteer($scope.globalData.causes.volunteers, 100000000)
                }
                else if (!isCauseSelected && !isSkillSelected) {
                    $scope.appendVolunteersToTable($scope.globalData.allApproved_Vol)
                }
                else if (!isCauseSelected && isSkillSelected) {
                    if (skillSetID) {
                        $scope.getSkilledVolunteers(isCauseSelected, skillSetID, 100000000)
                    }
                    else if (skillSetID == false) {
                       //break;   
                    }
                    else {
                        $scope.getSkilledVolunteers(isCauseSelected, $scope.globalData.SkillId, 100000000)
                    }

                }
                else if (isCauseSelected && isSkillSelected) {

                    if (skillSetID) {
                        $scope.getSkilledVolunteers(isCauseSelected, skillSetID, 100000000)
                    }
                    else if (skillSetID == false) {
                        //break;   
                    }
                    else {
                        $scope.getSkilledVolunteers(isCauseSelected, $scope.globalData.SkillId, 100000000)
                    }

                }

            }
            else {
                if (isCauseSelected && !isSkillSelected) {

                    $scope.getCauseVolunteer($scope.globalData.causes.volunteers, '');
                }
                else if (!isCauseSelected && !isSkillSelected) {
                    $scope.appendVolunteersToTable($scope.globalData.allVolunteers)
                }
                else if (!isCauseSelected && isSkillSelected) {

                    if (skillSetID) {
                        $scope.getSkilledVolunteers(isCauseSelected, skillSetID, '')
                    }
                    else if (skillSetID == false) {
                        //break;   
                    }
                    else {
                        $scope.getSkilledVolunteers(isCauseSelected, $scope.globalData.SkillId, '')
                    }
                }
                else if (isCauseSelected && isSkillSelected) {

                    if (skillSetID) {
                        $scope.getSkilledVolunteers(isCauseSelected, skillSetID, '')
                    }
                    else if (skillSetID == false) {
                        //break;   
                    }
                    else {
                        $scope.getSkilledVolunteers(isCauseSelected, $scope.globalData.SkillId, '')
                    }
                }
            }
        }



        $scope.getCauseVolunteer = function (filteredData, status) {

            var queryValues = '';
            _.forEach(filteredData, function (volunteer) {
                queryValues += '<value>{' + volunteer.new_volunteerid + '}</value>';
            })
            if (filteredData.length !== 0) {
                var queryString = CommonService.createQueryStringNonEmpty(queryValues, status);
                ngoEventService.getEmptyVolunteers(queryString).then(function (sameCause_Vol) {
                    $scope.appendVolunteersToTable(sameCause_Vol.data.value);
                })
            }
            else {
                $scope.appendVolunteersToTable([]);
            }
        }



        $scope.getSkilledVolunteers = function (isCauseSelected, skillSetID, status) {
            $scope.globalData.SkillId = skillSetID;
            var queryString = 'new_skillsetid eq ' + $scope.globalData.SkillId;
            ngoEventService.getvolunteerBySkills(queryString).then(function (skilledVolunteer) {
                $scope.globalData.skilledVolunteers = skilledVolunteer.data.value;
                $scope.globalData.SameSkillVolArray = [];
                for (var volunteer = 0; volunteer < $scope.globalData.skilledVolunteers.length; volunteer++) {
                    $scope.globalData.SameSkillVolArray.push($scope.globalData.skilledVolunteers[volunteer].new_volunteerid);
                }
                if (isCauseSelected == false) {
                    $scope.getAppSkillVolunteers($scope.globalData.skilledVolunteers, status);
                }
                else {
                    $scope.filteredVolunteers($scope.globalData, status);
                }
            })
        }

        $scope.getAppSkillVolunteers = function (filteredData, status) {
            var queryValue1 = '';
            _.forEach(filteredData, function (volunteer) {
                queryValue1 += '<value>{' + volunteer.new_volunteerid + '}</value>';
            })

            if (filteredData.length !== 0) {
                var queryString1 = CommonService.createQueryStringNonEmpty(queryValue1, status);
                ngoEventService.getEmptyVolunteers(queryString1).then(function (sameSkill_Vol) {
                    $scope.appendVolunteersToTable(sameSkill_Vol.data.value);
                })
            }
            else {
                $scope.appendVolunteersToTable([]);
            }
        }



        $scope.filteredVolunteers = function (globalData, status) {
            $scope.globalData.exactSkillCause = [];
            $scope.globalData.exactSkillCause = _.intersection(globalData.SameCauseVolArray, globalData.SameSkillVolArray);
            $scope.filteredVolunteersList(status);
        };

        $scope.filteredVolunteersList = function (status) {
            var queryValues = '';
            for (var vol = 0; vol < $scope.globalData.exactSkillCause.length; vol++) {
                queryValues += '<value>{' + $scope.globalData.exactSkillCause[vol] + '}</value>';
            }
            if (queryValues != '') {
                var queryString = CommonService.createQueryStringNonEmpty(queryValues, status);
                ngoEventService.getEmptyVolunteers(queryString).then(function (filteredVolunteersDetails) {
                    $scope.globalData.volunteerDetails = filteredVolunteersDetails.data.value;                   
                    $scope.appendVolunteersToTable(filteredVolunteersDetails.data.value)
                });
            }
            else {
                $scope.appendVolunteersToTable([]);
            }
        };

        $scope.getSelfRegisteredVols = function (isSelfRegistered) {
            if (isSelfRegistered) {
                this.allApproved = false;
                this.sameCauseVol = false;
                this.sameSkillVol = false;              
                var queryString = '$filter=_new_event_value eq ' + $scope.globalData.event._new_usedforcamp_value + ' and ( _new_campactivityname_value eq null or _new_campactivityname_value eq ' + $scope.globalData.event.new_eventactivityid + ' ) ';
                ngoEventService.getassignVolunteerDetails(queryString).then(function (campActivityMembers) {
                    $scope.campActivityMembers = campActivityMembers.data.value;

                    $scope.appendSFVolunteersToTable($scope.campActivityMembers);
                });
            }
            else {
                $scope.appendVolunteersToTable($scope.globalData.allVolunteers)
            }
        }


        $scope.appendSFVolunteersToTable = function (filteredData) {

            var sp_table = [];
            var results = [];          
            var volDetails = $scope.globalData.allVolunteers;

            _.forEach(filteredData, function (selectedVolunteer) {

                if (selectedVolunteer.new_selfregistered_p == true && selectedVolunteer._new_campactivityname_value == null) {
                    results.push(_.filter(volDetails, { 'new_volunteerid': selectedVolunteer._new_volunteername_value })[0]);
                }
            });
         
            _.forEach(filteredData, function (SelfRegisteredVolunteer) {
                if (SelfRegisteredVolunteer._new_campactivityname_value != null && SelfRegisteredVolunteer.new_selfregistered_p == true) {                   
                    _.forEach(results, function (srVol) {                        
                        if (srVol) {
                            if (srVol.new_volunteerid == SelfRegisteredVolunteer._new_volunteername_value) {                                
                                if (SelfRegisteredVolunteer.new_volunteerstatus == 2) {
                                    sp_table.push({
                                        'new_name': srVol.new_name,
                                        'new_nameofvolunteer': srVol.new_nameofvolunteer,
                                        'status': true,
                                        'new_city': srVol.new_city,
                                        'new_totalvolunteerhours': srVol.new_totalvolunteerhours,
                                        'new_volunteerid': srVol.new_volunteerid
                                    });
                                }
                                else {
                                    sp_table.push({
                                        'new_name': srVol.new_name,
                                        'new_nameofvolunteer': srVol.new_nameofvolunteer,
                                        'status': false,
                                        'new_city': srVol.new_city,
                                        'new_totalvolunteerhours': srVol.new_totalvolunteerhours,
                                        'new_volunteerid': srVol.new_volunteerid
                                    });
                                }
                                _.remove(results, srVol);
                            }
                        }
                    });



                }


            });


            _.forEach(results, function (srVol) {               
                sp_table.push({
                    'new_name': srVol.new_name,
                    'new_nameofvolunteer': srVol.new_nameofvolunteer,
                    'status': false,
                    'new_city': srVol.new_city,
                    'new_totalvolunteerhours': srVol.new_totalvolunteerhours,
                    'new_volunteerid': srVol.new_volunteerid
                });              
            });


            $scope.gridOptions.data = sp_table;
        }

        $scope.assignVolunteer = function (event, volunteer) {
            var filteredData = $scope.campActivityMembers;
            if (filteredData) {
                $scope.assignedVolunteer(event, volunteer, filteredData)
            }
            else {
                var queryString = '$filter=_new_event_value eq ' + $scope.globalData.event._new_usedforcamp_value + ' and ( _new_campactivityname_value eq null or _new_campactivityname_value eq ' + $scope.globalData.event.new_eventactivityid + ' ) ';
                ngoEventService.getassignVolunteerDetails(queryString).then(function (campEventActivityMembers) {
                    $scope.campEventActivityMembers = campEventActivityMembers.data.value;

                    $scope.assignedVolunteer(event, volunteer, $scope.campEventActivityMembers)
                });
            }
        };

        $scope.assignedVolunteer = function (event, volunteer, filteredData) {
            if (event) {
                if (filteredData.length > 0) {
                    var recordId;
                    var selectedVol = _.filter(filteredData, { '_new_volunteername_value': volunteer.new_volunteerid, 'new_selfregistered_p': true });//, 'new_selfregistered_p': true,'_new_campactivityname_value':$scope.globalData.event.new_eventactivityid })[0];
                    if (selectedVol.length > 0) {

                        var vol = _.filter(selectedVol, { '_new_campactivityname_value': $scope.globalData.event.new_eventactivityid })[0];

                        if (vol) {
                            recordId = vol.new_campactivitymemberid;
                            var UpdateVolunteer = { 'new_volunteerstatus': 2 };
                            ngoEventService.updateStatusOfVol(recordId, UpdateVolunteer).then(function (response) {
                                console.log(response);
                            });

                        }
                        else {
                            var Volunteer = {
                                'new_volunteertypeorignal': volunteer.new_constituentvolunteertype,
                                'new_name': volunteer.new_nameofvolunteer,
                                'new_volunteerstatus': 2,
                                'new_city': volunteer.new_city,
                                'new_Volunteername@odata.bind': '/new_volunteers(' + volunteer.new_volunteerid + ')',
                                'new_campactivityname@odata.bind': '/new_eventactivities(' + $scope.globalData.event.new_eventactivityid + ')',
                                'new_event@odata.bind': '/new_camps(' + $scope.globalData.event._new_usedforcamp_value + ')',
                                'new_selfregistered_p': 'true'

                            }
                            ngoEventService.assignVolunteertoEvent(Volunteer).then(function (response) {
                                console.log(response);
                            });
                        }


                    }
                    else {
                        var Volunteer = {
                            'new_volunteertypeorignal': volunteer.new_constituentvolunteertype,
                            'new_name': volunteer.new_nameofvolunteer,
                            'new_volunteerstatus': 2,
                            'new_city': volunteer.new_city,
                            'new_Volunteername@odata.bind': '/new_volunteers(' + volunteer.new_volunteerid + ')',
                            'new_campactivityname@odata.bind': '/new_eventactivities(' + $scope.globalData.event.new_eventactivityid + ')',
                            'new_event@odata.bind': '/new_camps(' + $scope.globalData.event._new_usedforcamp_value + ')'
                        }
                        ngoEventService.assignVolunteertoEvent(Volunteer).then(function (response) {
                            console.log(response);
                        });
                    }

                }
                else {
                    var Volunteer = {
                        'new_volunteertypeorignal': volunteer.new_constituentvolunteertype,
                        'new_name': volunteer.new_nameofvolunteer,
                        'new_volunteerstatus': 2,
                        'new_city': volunteer.new_city,
                        'new_Volunteername@odata.bind': '/new_volunteers(' + volunteer.new_volunteerid + ')',
                        'new_campactivityname@odata.bind': '/new_eventactivities(' + $scope.globalData.event.new_eventactivityid + ')',
                        'new_event@odata.bind': '/new_camps(' + $scope.globalData.event._new_usedforcamp_value + ')'
                    }
                    ngoEventService.assignVolunteertoEvent(Volunteer).then(function (response) {
                        console.log(response);
                    });
                }
            }
            else {

                if (filteredData.length > 0) {
                    var recordId;
                    var selectedVol1 = _.filter(filteredData, { '_new_volunteername_value': volunteer.new_volunteerid, '_new_campactivityname_value': $scope.globalData.event.new_eventactivityid })[0];

                    if (selectedVol1) {
                        recordId = selectedVol1.new_campactivitymemberid;
                        if (selectedVol1.new_selfregistered_p == true) {

                            var UpdateVolunteer1 = { 'new_volunteerstatus': 1 };
                            ngoEventService.updateStatusOfVol(recordId, UpdateVolunteer1).then(function (response) {
                                console.log(response);
                            });

                        }
                        else {

                            ngoEventService.deleteAssignedVolunteer(recordId).then(function (response) {
                                console.log('Delete');
                            });
                        }

                    }



                }
                else {
                    var queryString = '$filter=_new_volunteername_value eq ' + volunteer.new_volunteerid + ' and _new_campactivityname_value eq ' + $scope.globalData.event.new_eventactivityid;
                    ngoEventService.getassignVolunteerDetails(queryString).then(function (volunteerRes) {
                        var volDetails = volunteerRes.data.value;
                        var recordId = volDetails[0].new_campactivitymemberid;
                        ngoEventService.deleteAssignedVolunteer(recordId).then(function (response) {
                            console.log('Delete');
                        });
                    });
                }
            }



        }





        $scope.appendVolunteersToTable = function (filteredData) {
            var queryString = '$filter=_new_campactivityname_value eq ' + $scope.globalData.event.new_eventactivityid;
            ngoEventService.getassignVolunteerDetails(queryString).then(function (existingVol) {
                $scope.selfRegisteredVolunteers = existingVol.data.value;
                var spDetails = existingVol.data.value;
                var sp_table = [];

                _.forEach(filteredData, function (selectedProvider) {
                    selectedProvider.toAdd = 1;
                    _.forEach(spDetails, function (spDetails) {
                        if (selectedProvider.new_volunteerid === spDetails._new_volunteername_value) {
                                if (spDetails.new_selfregistered_p == false || (spDetails.new_selfregistered_p == true && spDetails.new_volunteerstatus == 2)) {    //Display only !selfRegistered 
                                selectedProvider.toAdd = 0;
                                sp_table.push({
                                    'new_name': selectedProvider.new_name,
                                    'new_nameofvolunteer': selectedProvider.new_nameofvolunteer,
                                    'status': true,
                                    'new_city': selectedProvider.new_city,
                                    'new_totalvolunteerhours': selectedProvider.new_totalvolunteerhours,
                                    'new_volunteerid': selectedProvider.new_volunteerid
                                });
                            }
                        }

                    });
                });

                _.forEach(filteredData, function (selectedProvider) {
                    if (selectedProvider.toAdd == 1) {
                        sp_table.push({
                            'new_name': selectedProvider.new_name,
                            'new_nameofvolunteer': selectedProvider.new_nameofvolunteer,
                            'status': false,
                            'new_city': selectedProvider.new_city,
                            'new_totalvolunteerhours': selectedProvider.new_totalvolunteerhours,
                            'new_volunteerid': selectedProvider.new_volunteerid

                        });
                    }
                });

                $scope.gridOptions.data = sp_table;

            });


        }
    }])
    .factory('ngoEventService', function ($http, CommonService) {
        return {
            getSkillSets: function () {
                return $http({
                    method: 'GET',
                    url: CommonService.serverURL + '/api/data/v8.0/new_new_eventactivity_new_skillsetset?$filter=new_eventactivityid eq ' + CommonService.recordId
                });
            },
            getEventActivityDetails: function () {
                return $http({
                    method: 'GET',
                    url: CommonService.serverURL + '/api/data/v8.0/new_eventactivities(' + CommonService.recordId + ')'
                });
            },
            getvolunteerBySkills: function (querystring) {
                return $http({
                    method: 'GET',
                    url: CommonService.serverURL + '/api/data/v8.0/new_new_skillset_new_volunteerset?$filter=' + querystring
                });
            },
            getvolunteerByCause: function (cause) {
                return $http({
                    method: 'GET',
                    url: CommonService.serverURL + '/api/data/v8.0/new_new_areaofinterest_new_volunteerset?$filter=new_areaofinterestid eq ' + cause
                });
            },
            getEventCause: function (cause) {
                return $http({
                    method: 'GET',
                    url: CommonService.serverURL + '/api/data/v8.0/new_camps(' + cause + ')?$select=_new_cause_value'
                });
            },
            getNonEmpty: function (queryString) {
                return $http({
                    method: 'GET',
                    url: CommonService.serverURL + '/api/data/v8.0/new_new_skillset_new_volunteerset?' + queryString
                });
            },
            getEmptyVolunteers: function (queryString) {
                return $http({
                    method: 'GET',
                    url: CommonService.serverURL + '/api/data/v8.0/new_volunteers?' + queryString
                });
            },
            getNonEmptyCauseVolunteer: function () {
                return $http({
                    method: 'GET',
                    url: CommonService.serverURL + '/api/data/v8.0/new_new_areaofinterest_new_volunteerset'
                });
            },
            assignVolunteertoEvent: function (volunteer) {
                return $http({
                    method: 'POST',
                    url: CommonService.serverURL + '/api/data/v8.0/new_campactivitymembers',
                    data: volunteer
                });
            },

            updateStatusOfVol: function (recordID, data) {
                return $http({
                    method: 'PATCH',
                    url: CommonService.serverURL + '/api/data/v8.0/new_campactivitymembers(' + recordID + ')',
                    data: data
                });

            },

            getassignVolunteerDetails: function (queryString) {
                return $http({
                    method: 'GET',
                    url: CommonService.serverURL + '/api/data/v8.0/new_campactivitymembers?' + queryString
                });
            },

            deleteAssignedVolunteer: function (recordID) {
                return $http({
                    method: 'DELETE',
                    url: CommonService.serverURL + '/api/data/v8.0/new_campactivitymembers(' + recordID + ')'
                });
            },
            //Added by Pranali
            getSkillSet: function () {
                return $http({
                    method: 'GET',
                    url: CommonService.serverURL + '/api/data/v8.0/new_skillsets'
                });
            }
        };
    }).factory('httpRequestInterceptor', function () {
        return {
            request: function (config) {
                config.headers['Accept'] = 'application/json';
                config.headers['Content-Type'] = 'application/json; charset=utf-8';
                config.headers['OData-MaxVersion'] = '4.0';
                config.headers['Prefer'] = 'odata.include-annotations="*"';
                config.headers['OData-Version'] = '4.0';
                return config;
            }
        };
    }).config(function ($httpProvider) {
        $httpProvider.interceptors.push('httpRequestInterceptor');
    }).service('CommonService', function () {
        this.recordId = (window.parent.Xrm.Page.data.entity.getId()).replace('{', '').replace('}', '');

        this.serverURL = window.parent.Xrm.Page.context.getClientUrl();

        this.createQueryStringNonEmpty = function (queryValues, statusCode) {
            var conditionAttribute = '';
            if (statusCode !== '') {
                conditionAttribute = '<condition attribute="statuscode" operator="eq" value="' + statusCode + '" />'
            }
            return 'fetchXml=<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">' +
                ' <entity name="new_volunteer">  ' +
                '<order attribute="new_name" descending="false" />' +
                '<filter type="and">' +
                '<condition attribute="statecode" operator="eq" value="0" />' +
                '<condition attribute="new_volunteerid" operator="in">' + queryValues +
                '</condition>' + conditionAttribute +
                '</filter>' +
                '</entity>' +
                '</fetch>';
        };
        this.createQueryStringEmpty = function (queryValues, statusCode) {
            var conditionAttribute = '';
            if (statusCode !== '') {
                conditionAttribute = '<condition attribute="statuscode" operator="eq" value="' + statusCode + '" />'
            }
            return 'fetchXml=<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">' +
                ' <entity name="new_volunteer">  ' +
                '<order attribute="new_name" descending="false" />' +
                '<filter type="and">' +
                '<condition attribute="new_volunteerid" operator="not-in">' + queryValues +
                '</condition>' + conditionAttribute +
                '</filter>' +
                '</entity>' +
                '</fetch>';
        };

   
       
        this.createQueryStringisAssigned = function (eventActivity) {
            return 'fetchXml=<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">' +
                '<entity name="new_campactivitymember">' +
                '<attribute name="new_name" />' +
                '<attribute name="new_volunteerstatus" />' +
                '<attribute name="new_volunteername" />' +
                '<attribute name="new_selfregistered_p" />' +
                '<attribute name="new_campactivityname" />' +
                '<attribute name="new_campactivitymemberid" />' +
                '<order attribute="new_name" descending="false" />' +
                '<filter type="and">' +
                '<condition attribute="new_campactivityname" operator="eq" value="{' + eventActivity + '}" />' +
                '</filter>' +
                '</entity>' +
                '</fetch>';
        };

    });