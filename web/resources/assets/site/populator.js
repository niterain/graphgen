$(document).ready(function(){
    var popForm = $('form#populator');
    $('#triggerPopBox').click(function(e){
        if (!$('#gjson_result').is(':empty')){
            resetBoxContents();
        } else {
            console.log('No graph has been generated');
            e.stopPropagation();
        }
    });
    popForm.submit(function(e){
        e.preventDefault();
        popForm.hide();
        $('#modal-populate-loading').show();
        $('form#populator :input').prop('disabled', true);
        var inputBox = $('#populate-debug-box');
        var url = getUrl();
        var ei = $('#populate-location').val();
        var external = $('form#populator').attr('server-populator');
        var queriesEndpoint = popForm.attr('action');
        var emptyDB = $('#populate-empty-condition').is(':checked');
        var pattern = $('#gjson_result').html();
        var postCypher = $.post(queriesEndpoint, {'pattern': pattern});
        postCypher.done(function (data) {

            if (ei !== 'http://localhost:7474' && ei !== 'http://127.0.0.1:7474' && ei !== 'http://dev:7474') {
                console.log('populate server');
                var resul = serverPopulate(external, data, emptyDB);
                var da = JSON.parse(resul);
                var browser = da.browser;
                var queries = JSON.parse(data);
                var constraintsCount = Object.keys(queries.constraints).length;
                var nodesCount = countNodes(queries.nodes);
                var edgesCount = countEdges(queries.edges);
                $('#modal-populate-loading').hide();
                inputBox.append('<div class="alert alert-info" role="alert">' + constraintsCount + ' Constraints created</div>');
                inputBox.append('<div class="alert alert-info" role="alert"> '+ nodesCount +' Nodes imported</div>');
                var msg = 'Data successfully loaded in your database. ' +
                    'Open it <a href="' + browser + '" target="_blank">' + browser + '</a>';

                inputBox.append('<div class="alert alert-info" role="alert">' + edgesCount + ' Relationships imported</div>');
                inputBox.append('<div class="alert alert-success" role="alert">' + msg + '</div>');
                return true;
            } else {

                if (emptyDB){
                    var emptyStatement = JSON.stringify({
                        statements: [{
                            statement: 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE r,n'
                        }]
                    });
                    if (!sendStatement(url, emptyStatement)){
                        $('form#populator :input').prop('disabled', false);
                        popForm.show();
                        return false;
                    }
                    console.log('Database cleared');
                    inputBox.html('<div class="alert alert-info" role="alert">Database cleared</div>');
                }

            var queries = JSON.parse(data);
            var constraintsCount = Object.keys(queries.constraints).length;
            var nodesCount = countNodes(queries.nodes);
            var edgesCount = countEdges(queries.edges);

            if (sendConstraints(url, queries.constraints) != true){
                $('form#populator :input').prop('disabled', false);
                popForm.show();
                return false;
            }
            inputBox.append('<div class="alert alert-info" role="alert">' + constraintsCount + ' Constraints created</div>');

            if (!loadNodes(url, queries.nodes)){
                $('form#populator :input').prop('disabled', false);
                popForm.show();
                return false;
            }
            inputBox.append('<div class="alert alert-info" role="alert"> '+ nodesCount +' Nodes imported</div>');

            if (!loadEdges(url, queries.edges)){
                $('form#populator :input').prop('disabled', false);
                popForm.show();
                return false;
            }

            var msg = 'Data successfully loaded in your database. ';

            inputBox.append('<div class="alert alert-info" role="alert">' + edgesCount + ' Relationships imported</div>');
            inputBox.append('<div class="alert alert-success" role="alert">' + msg + '</div>');

        }});
    });

    function getUrl()
    {
        var url = $('#populate-location').val() + '/db/data/transaction/commit';
        return url;
    }

    function getBrowserUrl()
    {
        var url = $('#populate-location').val() + '/browser';
        return url;
    }

    function sendStatement(endpoint, data)
    {
        var neoError;
        var user = $('#populate-user').val();
        var pwd = $('#populate-password').val();
        var token = user + ':' +pwd;
        var hash = btoa(token);
        var authHeader = 'Basic ' + hash;
        $.ajax({
            url: endpoint,
            type: "POST",
            beforeSend: function (xhr){
                xhr.setRequestHeader('Authorization', authHeader);
            },
            data: data,
            async: false,
            contentType: "application/json"
        })
            .done(function(result){
                neoError = result.errors;

            })
            .fail(function(error){
                console.log(error.statusText);
                displayError(error.statusText);
                return false;
            });
        if (neoError.length == 0){
            return true;
        } else {
            displayError(neoError.message);
            console.log(neoError);
            return false;
        }
    }

    function serverPopulate(endpoint, data, doEmpty)
    {
        if (doEmpty == 'undefined') {
            doEmpty = false;
        }
        var neoError = '';
        var neoresult = '';
        var user = $('#populate-user').val();
        var pwd = $('#populate-password').val();
        var host = $('#populate-location').val();
        var dat = {
            user: user,
            host: host,
            password: pwd,
            data:data,
            doEmpty:doEmpty
        };
        $.ajax({
            url: endpoint,
            type: "POST",
            data: dat,
            async: false
        })
            .done(function(result){
                neoresult = result;
                return true;

            })
            .fail(function(error){
                console.log(error.statusText);
                neoError = error.statusText;
                return false;
            });

        if (neoError.length == 0){
            return neoresult;
        } else {
            displayError(neoError);
            console.log(neoError);
            return false;
        }
    }

    function resetBoxContents()
    {
        popForm.show();
        $('#popResult').html('');
        $('#populate-debug-box').html('');
        $('form#populator :input').prop('disabled', false);
    }

    function displayError(error)
    {
        $('#popResult').html('<div class="alert alert-danger" role="alert">' + error + '</div>');
        $('form#populator :input').prop('disabled', false);
    }

    function sendConstraints(url, constraints){
        $.each(constraints, function(index, constraint){
            var body = JSON.stringify({
                statements: [{
                    statement: constraint
                }]
            });
            if (!sendStatement(url, body)){
                return false;
            }
        });
        console.log('Constraints created');
        return true;
    }

    function loadNodes(url, nodes){
        $.each(nodes, function(index, nodeMap){
            var nodesBody = JSON.stringify({
                statements: [{
                    statement:  nodeMap.statement,
                    parameters: nodeMap.parameters
                }]
            });
            if (!sendStatement(url, nodesBody))
            {
                return false;
            }
        });
        console.log('Nodes created');
        return true;
    }

    function loadEdges(url, edges){
        $.each(edges, function(index, edgeMap){
            var edgesBody = JSON.stringify({
                statements: [{
                    statement:  edgeMap.statement,
                    parameters: edgeMap.parameters
                }]
            });
            if (!sendStatement(url, edgesBody)){
                return false;
            }
        });
        console.log('Edges created');
        return true;
    }

    function countNodes(nodes)
    {
        var x = 0;
        $.each(nodes, function(index, map){
            x = x + Object.keys(map.parameters.props).length;
        });
        return x;
    }

    function countEdges(edges)
    {
        var x = 0;
        $.each(edges, function(index, map){
            if (map.parameters !== undefined){
                x = x + Object.keys(map.parameters.pairs).length;
            }
        });

        return x;
    }
});