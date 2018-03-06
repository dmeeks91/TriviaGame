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
                    game.score.timeX ++;
                    toastr['error']("TIME UP!");
                    game.showScore();
                    game.showAnsSummary(-1).then(
                        function(show)
                        {
                            if(show) setTimeout(function(){game.nextQ();},3000);
                        }
                    );
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
            var self = this;
            return new Promise(
                function(resolve, reject) {
                    try
                    {
                        var correct,
                            slctd;
                        for(var i=0; i < self.ansOrder.length; i++)
                        {
                            slctd = (indx === i);
                            correct = (self.ansOrder[i] === 3);
                            if (correct)
                            {
                                self.setAnsBtnColor(`#ans${i + 1}`,'correct');
                            }
                            else if (slctd)
                            {
                                self.setAnsBtnColor(`#ans${indx + 1}`,'incorrect');
                            }
                            else
                            {
                                self.setAnsBtnColor(`#ans${i + 1}`,'unselected');
                            }
                        }
                        resolve(true);
                    }
                    catch(e)
                    {
                        reject(false);
                    }
                })                
        },
        setQDisplay: function(qObj, ansOrd) {
            $('#qHolder').html(qObj.question);
            $('#qSum').html(`<div class="row">
                                <div class = "left">
                                    <b>Question:</b> ${this.qIndx + 1} of ${this.qBank.length} 
                                </div>
                                <div class = "center">
                                    <b>Category:</b> ${qObj.category}
                                </div>
                                <div class = "right">
                                    <b>Difficulty:</b> ${qObj.difficulty} 
                                </div>                                    
                            </div>`);
                                
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

            console.log(ansOrd)
        },
        nextQ: function() {
            this.qIndx ++;
            if(this.qIndx < this.qBank.length)
            {
                this.showQ();
                this.clock.reset();
            }
            else
            {
                this.hideShowSections('gameOver');
                $('#sumTitle').text('GAME OVER click to play again!');
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
        smartSelect: function(elID) {
            return app.smartSelect.create({
                        closeOnSelect: true,
                        el: elID});
        },
        initSS: function() {
            $('#ctgOptions').append('<option value="0" selected>Any Category</option>');
            $.each(game.ctgBank, function(key,value) {
                $('#ctgOptions').append('<option value="'+ value.index + '">' + value.title + '</option>');
            });

            $('#dOptions').append('<option value="0" selected>Any Difficulty</option>');
            $.each(['Easy','Medium','Hard'], function(key, value) {
                $('#dOptions').append('<option value="'+ value.toLowerCase() + '">' + value + '</option>');
            });

            $.each([5, 10, 15, 20], function(key, value) {
                $('#qOptions').append('<option value="'+ value + '">' + value + '</option>');
            });

            this.newGame();

            app.emit('initSmartSelect', [
                {obj: qSelect, init: 5},
                {obj: ctgSelect, init: 'Any Category'}, 
                {obj: dSelect, init: 'Any Difficulty'}
            ]);
        },
        hideShowSections: function(type) {
            switch (type)
            {
                case 'setDetails':
                    $('#newGame').hide();
                    $('#qSection').hide();
                    $('#slctDtls').show();  
                    $('#timeANDsum').hide();
                    $('#timeDiv').hide();                    
                    break;
                case 'playGame':
                    $('#newGame').hide();
                    $('#qSection').show();
                    $('#slctDtls').hide();  
                    $('#timeANDsum').show();
                    $('#timeDiv').show();
                    
                    break;
                case 'gameOver':
                    $('#newGame').show();
                    $('#qSection').hide();
                    $('#slctDtls').hide();  
                    $('#timeANDsum').show();
                    $('#timeDiv').hide();                    
                    break;
                
            }
        },
        newGame: function() {
            this.status = 'waiting';
            this.clock.reset();
            this.qIndx = 0;
            this.score.right = 0;
            this.score.wrong = 0;
            this.score.timeX = 0;
            this.showScore();
            $('#sumTitle').text('Time Remaing:');
            this.hideShowSections('setDetails');
        }
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

    var ctgSelect = game.smartSelect('#ctgSelect'); 

    var qSelect = game.smartSelect('#qSelect');

    var dSelect = game.smartSelect('#dSelect');

    $('#btnStart').on('click', function(e){
        if (game.status === 'waiting') //Only allow 1st click to register
        {   
            game.status = 'selected';         
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
                    game.hideShowSections('playGame');           
                });
        }
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
                    toastr[`${(data.correct) ? 'success' : 'error'}`](`${(data.correct) ? 'Correct' : 'Incorrect'} answer selected.`);
                    
                    (data.correct) ? game.score.right ++ : game.score.wrong ++;

                    game.showScore();

                    game.showAnsSummary(data.indx).then(
                        function(show)
                        {
                            if(show) setTimeout(function(){game.nextQ();},3500);
                        }
                    );

                }
            )
        }        
    });

    $('#newGame').on('click', function(e) {game.newGame();});

    game.initSS();
    
});
