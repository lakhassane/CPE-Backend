/**
 * Created by lakhassane on 25/03/2018.
 */
var express = require('express');
var request = require('request');
var bodyparser = require('body-parser');
var app = express();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:passer@localhost:7474');

    // BEGINNING - TASKS MANAGEMENT

    var Task = function Task( _node ) {
        this._node = _node;
    }
    Object.defineProperty( Task.prototype, 'task_name', {
        get: function() { return this._node.properties[ 'task_name' ]; }
    });
    Object.defineProperty( Task.prototype, 'task_id', {
        get: function() { return this._node.properties[ 'task_id' ]; }
    });


    var CTI = function CollaborativeTaskInstance( _node ) {
        this._node = _node;
    }
    Object.defineProperty( CTI.prototype, 'cti_name', {
        get: function() { return this._node.properties[ 'cti_name' ]; }
    });
    Object.defineProperty( CTI.prototype, 'cti_id', {
        get: function() { return this._node.properties[ 'cti_id' ]; }
    });
    Object.defineProperty( CTI.prototype, 'state', {
        get: function() { return this._node.properties[ 'state' ]; }
    });


    var STI = function SingleTaskInstance( _node ) {
        this._node = _node;
    }
    Object.defineProperty( STI.prototype, 'sti_name', {
        get: function() { return this._node.properties[ 'cti_name' ]; }
    });
    Object.defineProperty( STI.prototype, 'sti_id', {
        get: function() { return this._node.properties[ 'cti_id' ]; }
    });
    Object.defineProperty( STI.prototype, 'state', {
        get: function() { return this._node.properties[ 'state' ]; }
    });

    var WPI = function WorkProductInstance( _node ) {
        this._node = _node;
    }
    Object.defineProperty( WPI.prototype, 'wpi_name', {
        get: function() { return this._node.properties[ 'wpi_name' ]; }
    });
    Object.defineProperty( WPI.prototype, 'wpi_id', {
        get: function() { return this._node.properties[ 'wpi_id' ]; }
    });

    var actor = function Actor( _node ) {
        this._node = _node;
    }
    Object.defineProperty( actor.prototype, 'name', {
        get: function() { return this._node.properties[ 'name' ]; }
    });

    var workproduct = function WorkProduct( _node ) {
        this._node = _node;
    }
    Object.defineProperty( workproduct.prototype, 'name', {
        get: function() { return this._node.properties[ 'name' ]; }
    });
    Object.defineProperty( workproduct.prototype, 'type', {
        get: function() { return this._node.properties[ 'type' ]; }
    });


    /** 
     * This function allows to insert the task inside the database.
     * It also create at the same time the corresponding collaborative task instance (CTI)
     * and make the link between the two.
     * @params: task, cti
     * @date: 12/17/2018
     * @authors: M. L. Cisse
     * 
     */
    app.post('/api/taskcti', function ( req, res, next ) {
        var tasks = req.body;
        var query = [
            'CREATE (task:Task {task_id:{taskID}, task_name:{taskName}})' + 
            'CREATE (cti:CollaborativeTaskInstance {cti_id:{ctiID}, cti_name:{ctiName}, state:{ctiState}})' +
            'CREATE (task)-[:INSTANTIATED_AS]->(cti)'
        ].join( '\n' );

        var params = {
            taskID: tasks.task_id,
            taskName: tasks.task_name,
            ctiID: tasks.cti_id,
            ctiName: tasks.cti_name,
            ctiState: tasks.cti_state
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.sendStatus( 200 );
            }
        })
    });


    /** 
     * This function allows to insert the task inside the database.
     * It also create at the same time the corresponding single task instance (CTI)
     * and make the link between the two.
     * @params: task, sti
     * @date: 12/17/2018
     * @authors: M. L. Cisse
     * 
     */
    app.post('/api/tasksti', function ( req, res, next ) {
        var tasks = req.body;
        var query = [
            'CREATE (task:Task {task_id:{taskID}, task_name:{taskName}})' + 
            'CREATE (sti:SingleTaskInstance {sti_id:{stiID}, sti_name:{stiName}, state:{stiState}})' +
            'CREATE (task)-[:INSTANTIATED_AS]->(sti)'
        ].join( '\n' );

        var params = {
            taskID: tasks.task_id,
            taskName: tasks.task_name,
            stiID: tasks.sti_id,
            stiName: tasks.sti_name,
            stiState: tasks.sti_state
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.sendStatus( 200 );
            }
        })
    });


    /** 
     * NOT USED
     * This function applies the sequencing between two collaborative task instances.
     * @params: cti
     * @date: 03/31/2018
     * @authors: M. L. Cisse
     * 
     */
    app.post('/api/applysequencing', function ( req, res, next ) {
        var cti = req.body;
        var query = [
            'MATCH (cti:CollaborativeTaskInstance {cti_id: {ctiID}}) ' +
            'MATCH (cti2:CollaborativeTaskInstance {cti_id: {ctiSuccessor}}) ' +
            'MERGE (cti2) - [:FOLLOWS] -> (cti)'
        ].join( '\n' );

        var params = {
            ctiID: cti.cti_id,
            ctiSuccessor: cti.successor_id
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.sendStatus( 200 );
            }
        })
    });

    /**
     * This function allows to get all the tasks (ctis and stis).
     * @date: 12/17/2018
     * @authors: M. L. Cisse
     */
    app.get('/api/tasks', function( req, res, next ) {
        //var tasks = [];

        var query = [
            //'MATCH (task:Task) RETURN task'
            //'MATCH (cti:CollaborativeTaskInstance) RETURN cti'
            'MATCH (task:Task) - [:INSTANTIATED_AS] -> (alltask) RETURN alltask'
        ].join( '\n' );

        db.cypher({
            query: query
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                var tasks = results.map( function ( result ) {
                    return new Task( result['alltask'] );
                })
                return res.status( 200 ).send( tasks );
            }
        })
     });


    /**
     * NOT USED
     * In this function, we are going to add a new CTI for the specified task
     * @params: task id
     * @date: 03/29/2018
     * @authors: M. L. Cisse
     */
    app.post('/api/cti', function( req, res, next ) {
        var cti = req.body;
        var query = [
            'CREATE (cti:CollaborativeTaskInstance {cti_id:{ctiID}, cti_name:{ctiName}, state:{ctiState}})' +
            'CREATE (task) - [:INSTANTIATED_AS] -> (cti)'
            ].join( '\n' );

        var params = {
            ctiID: cti.cti_id,
            ctiName: cti.cti_name,
            ctiState: cti.state
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { return res.sendStatus( 200 ); }
        })
    })


    /**
     * This function allows to get a task given it's task id.
     * @params: task id
     * @date: 12/17/2018
     * @authors: M. L. Cisse
     */
    app.get('/api/task/:id', function( req, res, next ) {
        var task_id = req.params.id;
        var query = [
            'MATCH (task:Task {task_id: {taskID}}) return task'
            ].join( '\n' );

        var params = {
            taskID: task_id
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { 
                var task = results.map( function ( result ) {
                    return new Task( result['task'] );
                })
                return res.status( 200 ).send ( task); 
            }
        })
    })


    /**
     * This function allows to get everything about a CTI (STIS, Actors, WPI)
     * @params: cti id
     * @date: 03/19/2019
     * @authors: M. L. Cisse
     */
    app.get('/api/cti_all/:id', function( req, res, next ) {
        var cti_id = req.params.id;
        var query = [
            'MATCH (cti:CollaborativeTaskInstance {cti_id: {ctiID}}) - [:CONTAINS] -> (sti:SingleTaskInstance) '+ 
            '<- [:PERFORMS] - (actor:Actor) return cti, sti, actor'
            ].join( '\n' );

        var params = {
            ctiID: cti_id
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { 
                var cti = results.map( function ( result ) {
                    return new CTI( result['cti'] );
                })
                var stis = results.map( function ( result ) {
                    return new STI( result['sti'] );
                })
                var actors = results.map( function( result ) {
                    return new actor( result['actor'] );
                })
                return res.status( 200 ).send( { cti: cti, stis: stis, actor: actors } );
                //return res.status( 200 ).send ( cti ); 
            }
        })
    })

    /**
     * This function allows to get everything about a STI (STIS next and previous, WPI input and ouput, CTI)
     * @params: sti id
     * @date: 03/26/2019
     * @authors: M. L. Cisse
     */
    app.get('/api/sti_all/:id', function( req, res, next ) {
        var sti_id = req.params.id;
        var query = [
            'MATCH (sti:SingleTaskInstance {sti_id: {stiID}}) '+
            'OPTIONAL MATCH (next:SingleTaskInstance) - [:FOLLOWS] -> (sti) ' +
            'OPTIONAL MATCH (sti) - [:FOLLOWS] -> (previous:SingleTaskInstance) ' +
            'OPTIONAL MATCH (sti) <- [:CONTAINS] - (cti:CollaborativeTaskInstance) ' + 
            'OPTIONAL MATCH (sti) - [:USES{direction:"in"}] -> (input:WorkProductInstance)' +
            'OPTIONAL MATCH (sti) - [:USES{direction:"out"}] -> (output:WorkProductInstance)' +
            'return cti, next, sti, previous, input, output'
            ].join( '\n' );

        var params = {
            stiID: sti_id
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { 
                var cti = results.map( function ( result ) {
                    return new CTI( result['cti'] );
                })
                var sti = results.map( function ( result ) {
                    return new STI( result['sti'] );
                })
                var input = results.map( function( result ) {
                    return new WPI( result['input'] );
                })
                var output = results.map( function( result ) {
                    return new WPI( result['output'] );
                })
                var next = results.map( function( result ) {
                    return new STI( result['next'] );
                })
                var previous = results.map( function( result ) {
                    return new STI( result['previous'] );
                })
                return res.status( 200 ).send( { cti: cti, sti: sti, next: next, previous: previous, 
                	input: input, output: output } );
            }
        })
    })

    /*
     * This function allows to change the label of a give node.
     * @params: sti_id
     * @date: 03/26/2018
     * ^authors: M. L. Cisse
     */
    app.post('/api/changelabel', function( req, res, next ) {
    	var sti = req.body;

    	var query = [
			'MATCH (sti:SingleTaskInstance {sti_id: {stiID}}) <- [r:PERFORMS] - (actor:Actor) ' +
            'REMOVE sti:SingleTaskInstance ' +
            'SET sti:CollaborativeTaskInstance, sti.cti_id = sti.sti_id, sti.cti_name = sti.sti_name ' +
            'REMOVE sti.sti_id, sti.sti_name DELETE r'
			].join( '\n' );

		var params = {
			stiID: sti.sti_id
		};

		db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                //console.log( err );
                return res.sendStatus( 400 );
            } else {  
                return res.sendStatus( 200 ); 
            }
            
        })
    })

    /**
     * This function allows to delete the task instance sequences between the STIs of a given CTI
     * @params: cti id
     * @date: 03/22/2019
     * @authors: M. L. Cisse
     */
    app.post('/api/deletetis', function( req, res, next ) {
        var cti = req.body;
        var query = [
            'MATCH (c:CollaborativeTaskInstance {cti_id:{ctiID}}) - [:CONTAINS] -> (s:SingleTaskInstance) - ' +
            '[r:FOLLOWS] -> (s2:SingleTaskInstance) DELETE r'
            ].join( '\n' );

        var params = {
            ctiID: cti.cti_id
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.sendStatus( 200 );
            }
        })
    })


    /**
     * This function allows to delete the task instance parameters between STIs and WPIs
     * @params: cti id
     * @date: 03/22/2019
     * @authors: M. L. Cisse
     */
    app.post('/api/deletetip', function( req, res, next ) {
        var cti = req.body;
        var query = [
            'MATCH (c:CollaborativeTaskInstance {cti_id:{ctiID}}) - [:CONTAINS] -> (s:SingleTaskInstance) - ' +
            '[u:USES] -> (w:WorkProductInstance) DELETE u'
            ].join( '\n' );

        var params = {
            ctiID: cti.cti_id
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.sendStatus( 200 );
            }
        })
    })
    

    /**
     * This function record Single Task Instances in the database.
     * It updates the state of the parent task and link the STI to its CTI.
     * It also directly assigns the added sti to a chosen actor.
     * @params: sti (single task intance)
     * @date: 12/18/2018
     * @authors: M. L. Cisse
     */
    app.post('/api/sti', function( req, res, next ) {
        var sti = req.body;
        var query = [
            /*'MATCH (task:Task {task_id: {ctiID}}) SET task.state = \'Instantiated\' ' +
            'WITH task ' + */
            'MATCH (cti:CollaborativeTaskInstance {cti_id: {ctiID}}) SET cti.state =\'instantiated\' '  +
            'WITH cti ' +
            'MERGE (cti) - [:CONTAINS] -> (sti:SingleTaskInstance {sti_id: {stiID}, sti_name: {stiName}, state: {stiState}})'
        ].join( '\n' );
            
        var params = {
            stiID: sti.sti_id,
            stiName: sti.sti_name,
            stiState: sti.sti_state,
            ctiID: sti.cti_id
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {  return res.sendStatus( 200 ); }
        })

    });

    /**
     * This function record Work Product Instances in the database.
     * @params: wpi (work product intance)
     * @date: 01/13/2018
     * @authors: M. L. Cisse
     */
    app.post('/api/wpi', function( req, res, next ) {
        var wpi = req.body;
        var query = [
            'CREATE (wpi:WorkProductInstance {wpi_id:{wpiID}, wpi_name:{wpiName}})'
        ].join( '\n' );
            
        var params = {
            wpiID: wpi.wpi_id,
            wpiName: wpi.wpi_name
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {  
                return res.sendStatus( 200 ); 
            }
        })

    });

    /**
     * This function allows to get all the wpis.
     * @date: 01/14/2018
     * @authors: M. L. Cisse
     */
    app.get('/api/wpi', function( req, res, next ) {

        var query = [
            'MATCH (wpi:WorkProductInstance) RETURN wpi'
        ].join( '\n' );

        db.cypher({
            query: query
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                var wpis = results.map( function ( result ) {
                    return new WPI( result['wpi'] );
                })
                return res.status( 200 ).send( wpis );
            }
        })
     });


    /**
     * This function allows to get a wpi given the cti that produces it.
     * @params: cti_id
     * @date: 03/13/2019
     * @authors: M. L. Cisse
     */
    app.get('/api/wpibycti/:id', function( req, res, next ) {
        var cti_id = req.params.id;
        var query = [
            'MATCH (wpi:WorkProductInstance) <- [:USES {direction:{direction}}] - ' +
            '(cti:CollaborativeTaskInstance {cti_id:{ctiID}}) RETURN wpi'
        ].join( '\n' );

        var params = {
            ctiID: cti_id,
            direction: "out"
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                if ( err ) {
                    console.log( err );
                    return res.sendStatus( 400 );
                } else {
                    return res.status( 200 ).send( results );
                }
            }
        })
     });


    /**
     * NOT USED
     * This function allows to get all the STIs of a given CTI
     * @params: cti id
     * @date: 03/30/2018
     * @authors: M. L. Cisse
     */
    app.get('/api/sti', function( req, res, next ) {
        var cti_id = req.query.id;
        var query = [
            'MATCH (cti:CollaborativeTaskInstance {cti_id: {ctiID}}) - [:CONTAINS] -> (sti:SingleTaskInstance)' + 
                    ' <- [:PERFORMS] - (actor:Actor) RETURN sti, actor'
            ].join( '\n' );

        var params = {
            ctiID: cti_id
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { 
                var stis = results.map( function ( result ) {
                    return new STI( result['sti'] );
                })
                var actors = results.map( function( result ) {
                    return new actor( result['actor'] );
                })
                return res.status( 200 ).send( { stis: stis, actor: actors } );
            }
        })
    });


    /** 
     * NOT USED
     * This function return the state of the previous Single Task Instance given an STI.
     * @params: sti_name
     * @date: 04/04/2018
     * @authors: M. L. Cisse
     * 
     */
    app.get('/api/previousstistate', function( req, res, next ) {
        var sti_name = req.query.name;
        var query = [
            'MATCH (sti:SingleTaskInstance {sti_name: {stiName}}) - [:FOLLOWS] -> (sti2:SingleTaskInstance) RETURN sti2.state'
        ].join( '\n' );

        var params = {
            stiName: sti_name
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.status( 200 ).send( results );
            }
        })
    });


    /** 
     * This function applies the sequencing between two Single Task Instances.
     * @params: tis (TaskInstanceSequence)
     * @date: 12/18/2018
     * @authors: M. L. Cisse
     * 
     */
    app.post('/api/applypatternsequencing', function ( req, res, next ) {
        var tis = req.body;
        var query = [
            'MATCH (sti:SingleTaskInstance {sti_id: {stiIDPred}}), (sti2:SingleTaskInstance {sti_id: {stiIDSucc}})' +
            'MERGE (sti2) - [:FOLLOWS{wsType:{linkKind}}] -> (sti)'
        ].join( '\n' );
    
        var params = {
            stiIDPred: tis.predecessor_id,
            stiIDSucc: tis.successor_id,
            linkKind: tis.linkKind
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.sendStatus( 200 );
            }
        })
    });

    /** 
     * This function allows to apply the data flow between 
     * Work Product Instances of a composite WP and Single Task Instances of a CT.
     * @params: tip (taskInstanceParameter)
     * @date: 12/18/2018
     * @authors: M. L. Cisse
     * 
     */
    app.post('/api/applydataflow', function ( req, res, next ) {
        var tip = req.body;
        
        var query = [
            'MATCH (sti:SingleTaskInstance {sti_id: {stiID}})' +
            // 'MERGE (wpi:WorkProductInstance {wpi_name:{wpiName}, wpi_id: {wpiID}})' +
            'MATCH (wpi:WorkProductInstance {wpi_id: {wpiID}})' +
            'MERGE (sti) - [:USES{direction:{Direction}}] -> (wpi)'
            /*'MERGE (sti:SingleTaskInstance {sti_id: {stiID}}) - [:USES{direction:{Direction}}] -> '+
            '(wpi:WorkProductInstance {wpi_id: {wpiID}})'*/
        ].join( '\n' );

        var params = {
            stiID: tip.sti_id,
            Direction: tip.direction,
            //wpiName: tip.wpi,
            wpiID: tip.wpi
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.sendStatus( 200 );
            }
        })
    });

    /** 
     * This function allows to apply the data flow between 
     * Work Product Instance WP and a Collaborative Task Instance.
     * @params: tip (taskInstanceParameter)
     * @date: 12/18/2018
     * @authors: M. L. Cisse
     * 
     */
    app.post('/api/applydataflowCT', function ( req, res, next ) {
        var tip = req.body;
        
        var query = [
            'MATCH (cti:CollaborativeTaskInstance {cti_id: {ctiID}})' +
            'MATCH (wpi:WorkProductInstance {wpi_id: {wpiID}})' +
            'MERGE (cti) - [:USES{direction:{Direction}}] -> (wpi)'
        ].join( '\n' );

        var params = {
            ctiID: tip.cti_id,
            Direction: tip.direction,
            wpiID: tip.wpi
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.sendStatus( 200 );
            }
        })
    });

    /** 
     * This function allows to get the STIs inside of a CTI 
     * @params: cti_id
     * @date: 03/28/2019
     * @authors: M. L. Cisse
     * 
     */
    app.get('/api/instancebycti/:id', function( req, res, next ) {
        var cti_id = req.params.id;
        var query = [
            'MATCH (sti:SingleTaskInstance) <- [:CONTAINS] - '+
            '(cti:CollaborativeTaskInstance {cti_id: {ctiID}}) return sti'
            //'MATCH (sti:SingleTaskInstance) <- [:CONTAINS] - (cti:CollaborativeTaskInstance {cti_id: {ctiID}}) - ' +
            //'[:CONTAINS] -> (cti2:CollaborativeTaskInstance) RETURN sti, collect(DISTINCT cti2) as cti2'
            ].join( '\n' );

        var params = {
            ctiID: cti_id
        };
        
        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { 
                var stis = results.map( function ( result ) {
                    return new STI( result['sti'] );
                })
                /*var ctis = results.map( function ( result ) {
                    return new CTI( result['cti2'] );
                })*/
                //return res.status( 200 ).send( {stis: stis, ctis: ctis} );
                return res.status( 200 ).send( stis );
            }
        })
    });

    /** 
     * This function allows to get the CTIs inside of a CTI 
     * @params: cti_id
     * @date: 03/28/2019
     * @authors: M. L. Cisse
     * 
     */
    app.get('/api/instancectibycti/:id', function( req, res, next ) {
        var cti_id = req.params.id;
        var query = [
            'MATCH (cti2:CollaborativeTaskInstance) <- [:CONTAINS] - '+
            '(cti:CollaborativeTaskInstance {cti_id: {ctiID}}) return cti2'
            //'MATCH (sti:SingleTaskInstance) <- [:CONTAINS] - (cti:CollaborativeTaskInstance {cti_id: {ctiID}}) - ' +
            //'[:CONTAINS] -> (cti2:CollaborativeTaskInstance) RETURN sti, collect(DISTINCT cti2) as cti2'
            ].join( '\n' );

        var params = {
            ctiID: cti_id
        };
        
        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { 
                var ctis = results.map( function ( result ) {
                    return new CTI( result['cti2'] );
                })
                return res.status( 200 ).send( ctis );
            }
        })
    });


     /** 
     * This function returns the previous STI or CTI of a given STI. It also returns the WS, actor. 
     * @params: sti_id
     * @date: 03/28/2019
     * @authors: M. L. Cisse
     * 
     */
    app.get('/api/previoussti/:id', function( req, res, next ) {
        var sti_id = req.params.id;
        var query = [
            //'MATCH (sti:SingleTaskInstance {sti_id:{stiID}}) ' +
            //' OPTIONAL MATCH (sti) <- [:PERFORMS] - (actor:Actor) ' +
            //'OPTIONAL MATCH (sti) - [r:FOLLOWS] -> (sti2:SingleTaskInstance) return r, sti, sti2, actor'
            'MATCH (currentsti:SingleTaskInstance {sti_id:{stiID}}) ' +
            'OPTIONAL MATCH (currentsti) <- [:PERFORMS] - (actor:Actor) ' +
            'OPTIONAL MATCH (cti:CollaborativeTaskInstance) <- [rCTI:FOLLOWS] - (currentsti) ' +
            'OPTIONAL MATCH (currentsti) - [rSTI:FOLLOWS] -> (sti:SingleTaskInstance) ' +
            'RETURN rSTI, currentsti, sti, actor, cti, rCTI'
            ].join( '\n' );

        var params = {
            stiID: sti_id
        }

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { 
                var sti = results.map( function ( result ) {
                    return new STI( result['currentsti'] );
                })
                var previousSTI = results.map( function( result ) {
                    return new STI( result['sti'] );
                })
                var previousCTI = results.map( function( result ) {
                    return new STI( result['cti'] );
                })
                var actors = results.map( function( result ) {
                    return new actor( result['actor'] );
                })
               //return res.status( 200 ).send( { sti: sti, previous: previous, actor: actors, ws: results[0].r } );
               return res.status( 200 ).send( { sti: sti, previousSTI: previousSTI, previousCTI: previousCTI, 
                    actor: actors, wsSTI: results[0].rSTI, wsCTI: results[0].rCTI } );
            }
        })

    });

    /** 
     * This function returns the previous STI or CTI of a given CTI. 
     * @params: cti_id
     * @date: 03/28/2019
     * @authors: M. L. Cisse
     * 
     */
    app.get('/api/previousstiforcti/:id', function( req, res, next ) {
        var cti_id = req.params.id;
        var query = [
            'MATCH (currentcti:CollaborativeTaskInstance {cti_id:{ctiID}}) ' +
            'OPTIONAL MATCH (currentcti) <- [:PERFORMS] - (actor:Actor) ' +
            'OPTIONAL MATCH (cti:CollaborativeTaskInstance) <- [rCTI:FOLLOWS] - (currentcti) ' +
            'OPTIONAL MATCH (currentcti) - [rSTI:FOLLOWS] -> (sti:SingleTaskInstance) ' +
            'RETURN rSTI, currentcti, sti, actor, cti, rCTI'
            ].join( '\n' );

        var params = {
            ctiID: cti_id
        }

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { 
                var cti = results.map( function ( result ) {
                    return new STI( result['currentcti'] );
                })
                var previousSTI = results.map( function( result ) {
                    return new STI( result['sti'] );
                })
                var previousCTI = results.map( function( result ) {
                    return new STI( result['cti'] );
                })
                var actors = results.map( function( result ) {
                    return new actor( result['actor'] );
                })
                return res.status( 200 ).send( { cti: cti, previousSTI: previousSTI, previousCTI: previousCTI, 
                    actor: actors, wsSTI: results[0].rSTI, wsCTI: results[0].rCTI } );
            }
        })

    });

    app.post('/api/updatestate', function( req, res, next ) {
        var args = req.body;
        
        var query = [
            'MATCH (sti:SingleTaskInstance {sti_id: {stiID}})' +
            'SET sti.state = {state}'
        ].join( '\n' );

        var params = {
            stiID: args.sti_id,
            state: args.state
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.sendStatus( 200 );
            }
        })
    });

    // ENDING - TASKS MANAGEMENT


    // BEGIN - PATTERN MANAGEMENT
    var cpattern = function CollaborationPattern( _node ) {
        this._node = _node;
    }
    Object.defineProperty( cpattern.prototype, 'cp_name', {
        get: function() { return this._node.properties[ 'cp_name' ]; }
    });
    Object.defineProperty( cpattern.prototype, 'cp_id', {
        get: function() { return this._node.properties[ 'cp_id' ]; }
    });
    Object.defineProperty( cpattern.prototype, 'cp_alias', {
        get: function() { return this._node.properties[ 'cp_alias' ]; }
    });


    /**
     * This function get all the collaboration patterns
     * @date: 03/30/2018
     * @author: M. L. Cisse
     */
    app.get('/api/cpatterns', function( req, res, next ) {
        var query = [
            'MATCH (cpatterns:CollaborationPattern) RETURN cpatterns'
            ].join( '\n' );

        db.cypher({
            query: query
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                var patterns = results.map( function( result ) {
                    return new cpattern( result['cpatterns'] );
                })
                return res.status( 200 ).send( patterns );
            }
        })
    });

    /**
     * NOT USED
     * This function applies the chosen pattern to the given CTI
     * @date: 03/30/2018
     * @author: M. L. Cisse
     */
    app.post('/api/applypattern', function( req, res, next ) {
        var parameters = req.body;
        var query = [
            'MATCH (cpattern:CollaborationPattern {cp_id: {cpID}}), (cti:CollaborativeTaskInstance {cti_id: {ctiID}})' +
            'MERGE (cti) - [:DEPLOYED_WITH] -> (cpattern)'
            ].join( '\n' );

        var params = {
            cpID: parameters.pattern,
            ctiID: parameters.cti_id
        }

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { return res.sendStatus( 200 ); }
        })
    });
    // END - PATTERN MANAGEMENT

    // BEGIN - ACTOR MANAGEMENT
    /**
     * This function get all the actors
     * @date: 03/30/2018
     * @author: M. L. Cisse
     */
    app.get('/api/actors', function( req, res, next ) {
        var query = [
            'MATCH (actors:Actor) RETURN actors'
            ].join( '\n' );

        db.cypher({
            query: query
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                var actors = results.map( function( result ) {
                    return new actor( result['actors'] );
                })
                return res.status( 200 ).send( actors );
            }
        })
    });

    /**
     * This function assign the chosen actor to the chosen STI
     * @date: 03/15/2018
     * @author: M. L. Cisse
     */
    app.post('/api/assignactor', function( req, res, next ) {
        var parameters = req.body;
        var query = [
            'MATCH (actor:Actor {name: {actorName}})' +
            'MATCH (sti:SingleTaskInstance {sti_id: {stiID}}), (cti:CollaborativeTaskInstance {cti_id: {ctiID}})' +
            ' SET sti.state =\'assigned\', cti.state =\'assigned\' ' +
            'MERGE (actor) - [:PERFORMS] -> (sti)'
            ].join( '\n' );

        var params = {
            ctiID: parameters.cti_id,
            actorName: parameters.actor_name,
            stiID: parameters.sti_id
        }

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { return res.sendStatus( 200 ); }
        })
    });

    /**
     * NOT USED
     * This function get the actor of a given STI
     * @params sti_id
     * @date: 03/31/2018
     * @author: M. L. Cisse
     */
    app.get('/api/actorbysti', function( req, res, next ) {
        var sti_id = req.query.id;
        var query = [
            'MATCH (sti:SingleTaskInstance {sti_id: {stiID}}) <- [:PERFORMS] - (actor:Actor) RETURN actor'
            ].join( '\n' );

        var params = {
            stiID: sti_id
        }

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else { 
                var actor = results.map( function( result ) {
                    return new actor( result['actor'] );
                })
                return res.status( 200 ).send( actor ); 
            }
        })
    });
    // END - ACTOR MANAGEMENT

    // BEGIN - WORK PRODUCT MANAGEMENT
    /**
     * NOT USED
     * This function get all the work product
     * @date: 04/05/2018
     * @author: M. L. Cisse
     */
    app.get('/api/workproducts', function( req, res, next ) {
        var query = [
            'MATCH (wps:WorkProduct) RETURN wps'
            ].join( '\n' );

        db.cypher({
            query: query
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                var wps = results.map( function( result ) {
                    return new workproduct( result['wps'] );
                })
                return res.status( 200 ).send( wps );
            }
        })
    });

    /** 
     * NOT USED
     * This function allows to insert a work product in the database.
     * @params: workproduct
     * @date: 04/05/2018
     * @authors: M. L. Cisse
     * 
     */
    app.post('/api/workproduct', function ( req, res, next ) {
        var wp = req.body;
        var query = [
            'CREATE (wp:WorkProduct {name:{wpName}, type:{wpType}})'
        ].join( '\n' );

        var params = {
            wpName: wp.name,
            wpType: wp.type
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.sendStatus( 200 );
            }
        })
    });

    /**
     * NOT USED
     * This function get a Work Product and delete it from the database.
     * @date: 04/06/2018
     * @author: M. L. Cisse
     */
    app.delete('/api/workproduct', function( req, res, next ) {
        var name = req.query.name;
        var query = [
            'MATCH (wp:WorkProduct {name: {name}}) DELETE wp'
            ].join( '\n' );

        var params = {
            name: name
        };

        db.cypher({
            query: query,
            params: params
        }, function( err, results ) {
            if ( err ) {
                console.log( err );
                return res.sendStatus( 400 );
            } else {
                return res.sendStatus( 200 );
            }
        })
    });
    // END - WORK PRODUCT MANAGEMENT

    app.listen(8585)