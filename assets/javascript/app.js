//randomly generate questions using https://opentdb.com/api_config.php
$(document).ready(function(){
    var game = {
            status: 'waiting',
            score: {
                right:0,
                wrong: 0,
                timeX: 0,
            },
            clock: {
                interval: null,
                running: false,
                time: 30,
                start: function() {
                    if(!game.clock.running)
                    {
                        game.clock.interval = setInterval(game.clock.tick, 1000);
                        game.clock.running = true;
                    }
                },
                stop: function() {
                    clearInterval(game.clock.interval);
                    game.clock.running = false;
                },
                tick: function() {
                    if (game.clock.time > 0)
                    {
                        game.clock.time--;
                        var num = game.clock.time;
                        num = (parseInt(num)<10) ? '0' + num : num;
                        $('#timeDiv').text(`:${num}`);
                    }
                    else
                    {
                        clearInterval(game.clock.interval);
                        game.clock.running = false;
                        toastr['error']("TIME UP!");
                    }
                    
                },  
                reset: function() {
                    game.clock.time = 30;
                    $('#timeDiv').text(':30');
                } 
            },        
            qIndx: 0,
            qBank: [],
            ansOrder: [],     
            ctgBank: [
                {
                    title: 'Art',
                    index: 25,
                    imgSrc: ''
                },            
                {
                    title: 'History',
                    index: 23,
                    imgSrc: ''
                },            
                {
                    title: 'Music',
                    index: 12,
                    imgSrc: ''
                },
                {
                    title: 'Geography',
                    index: 22,
                    imgSrc: ''
                },            
                {
                    title: 'Sports',
                    index: 21,
                    imgSrc: ''
                },
            ],
            setAnsOrder: function() {
                var self = this;
                return new Promise(
                    function(resolve, reject) {
                        try 
                        {
                            var Q = self.qBank[self.qIndx],
                            num;
                            self.ansOrder = [];
                            
                            //Randomly generate order to load questions to form
                            do{
                                num = Math.floor(Math.random() * 4)
                                if(self.ansOrder.indexOf(num) === -1)
                                {
                                    self.ansOrder.push(num);
                                }
                            }
                            while(self.ansOrder.length != 4);
                        }
                        catch(e)
                        {
                            reject({Error: e});
                        }

                        resolve({qObj : Q, ansOrd : self.ansOrder});

                    });             


            },
            setAnsBtnColor: function(id, type) {
                $.each(['correct', 'incorrect', 'default', 'unselected'],
                    function(key, value)
                    {
                        if (type === value)
                        {
                            $(id).addClass(type);
                        }
                        else
                        {
                            $(id).removeClass(value);
                        }
                    });
            },
            showAnsSummary: function(indx) {
                var correct,
                    slctd;
                for(var i=0; i < this.ansOrder.length; i++)
                {
                    slctd = (indx === i);
                    correct = (this.ansOrder[i] === 3);
                    if (correct)
                    {
                        this.setAnsBtnColor(`#ans${i + 1}`,'correct');
                    }
                    else if (slctd)
                    {
                        this.setAnsBtnColor(`#ans${indx + 1}`,'incorrect');
                    }
                    else
                    {
                        this.setAnsBtnColor(`#ans${i + 1}`,'unselected');
                    }
                }
            },
            setQDisplay: function(qObj, ansOrd) {
                $('#qHolder').html(qObj.question);
                $('#qSum').html(`Question ${this.qIndx + 1} of ${this.qBank.length}   Category: ${qObj.category}`);
                var abc = ['A','B','C','D'],
                    wrgLen = qObj.incorrect_answers.length,
                    ansId,
                    ansIndx,                    
                    ansText;    
                for (var i=0; i<ansOrd.length; i++)
                {
                    ansIndx = ansOrd[i];
                    ansText = (ansIndx === wrgLen) ? 
                              qObj['correct_answer'] : 
                              qObj['incorrect_answers'][ansIndx];
                    ansId = `#ans${i+1}`;
                    $(ansId).html(`${abc[i]}. ${ansText}`);
                    game.setAnsBtnColor(ansId, 'default');
                }
                game.status = 'waiting';
                game.clock.start();
                console.log(qObj);
                console.log(ansOrd);
            },
            nextQ: function() {
                this.qIndx ++;
                if(this.qIndx < this.qBank.length)
                {
                    this.showQ();
                    this.clock.reset();
                }
            },
            showQ: function() {
                var self = this;
                self.setAnsOrder().then(
                    function(data) {
                        self.setQDisplay(data.qObj, data.ansOrd);
                });
            },
            showScore: function() {
                var name;
                for(var type in this.score)
                {
                    val = this.score[type];
                    $(`#${type}`).text(val);
                }
            },            
            isCorrect: function(ansText, i) {
                var self = this;
                return new Promise(
                    function(resolve, reject) {
                        try 
                        {
                            var qObj = self.qBank[self.qIndx];                            
                            resolve({correct: (qObj.correct_answer === ansText), indx: i});
                        }
                        catch(e)
                        {
                            reject({Error: e});
                        }                        
                    });
            },
               
        };

        toastr.options = {
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-bottom-center",
            "preventDuplicates": true,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "2500",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
          };

    var qSelect = app.smartSelect.create({
        closeOnSelect: true,
        el: '#qCount',
        on: {
            // If there is an onInit event use it to set the Initial values... look at .emit for a custom event
          close: function (e) {
            //For some reason the selected value wasn't showing after the initial close.             
            if (e.valueEl.innerText === '')
            {
                e.valueEl.innerText = "5";
            }
            if ($('#btnStart').hasClass('disabled'))
            {
                $('#btnStart').removeClass('disabled')
            }            
          },        
        }
      });
    
      var addOptions = function() {
        $('#ctgSelect').append('<option value="0" selected>Any Category</option>');
        $.each(game.ctgBank, function(key,value) {
            $('#ctgSelect').append('<option value="'+ value.index + '">' + value.title + '</option>');
        });

        $('#diffSelect').append('<option value="0" selected>Any Difficulty</option>');
        $.each(['Easy','Medium','Hard'], function(key, value) {
            $('#diffSelect').append('<option value="'+ value.toLowerCase() + '">' + value + '</option>');
        });

        $.each([5, 10, 15, 20], function(key, value) {
            $('#qstnCount').append('<option value="'+ value + '">' + value + '</option>');
        });                
    };

    $('#btnStart').on('click', function(e){
        var data = app.form.convertToData('#myForm'),
            url = "https://opentdb.com/api.php?type=multiple",
            val;

            for(var qStr in data)
            {
                val = data[qStr];
                if (val != "0")
                {
                    url += "&" + qStr + "=" + val;
                }
            }

            $.getJSON(url, 
            function(e){
                game.qBank = e.results; 
                game.showQ();
                $('#qSection').show();
                $('#slctDtls').hide();  
                $('#timeANDsum').show();           
            });
    });
    
    $('.ansBtn').on('click', function(e) {
        if (game.status === 'waiting') //Only allow 1st click to register
        {
            game.clock.stop();
            game.status = 'selected';
            var ansText = e.target.innerText.slice(e.target.innerText.indexOf('.') + 2).trim(),
                indx = parseInt(e.target.id.slice(e.target.id.indexOf('s')+1).trim()) - 1,
                $btn = e.target.id;

            game.isCorrect(ansText, indx).then(
                function(data)
                {
                    //var msg = `"Correct Answer: ${ansText}", "${(correct) ? 'Correct' : 'Incorrect'} answer selected."`
                    toastr[`${(data.correct) ? 'success' : 'error'}`](`${(data.correct) ? 'Correct' : 'Incorrect'} answer selected.`);
                    
                    if(data.correct)
                    {
                        game.score.right ++;
                    }
                    else
                    {
                        game.score.wrong ++;
                    }

                    game.showScore();
                    
                    /* game.nextQ(); */

                    game.showAnsSummary(data.indx);

                }
            )
        }        
    });

    addOptions(); 
});
