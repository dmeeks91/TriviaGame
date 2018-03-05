//randomly generate questions using https://opentdb.com/api_config.php
$(document).ready(function(){
    var game = {
            status: 'waiting',
            gTime: 0,
            qIndx: 0,
            qBank: [],
            ansOrder: [],    
            qTime: 0,    
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
            setQDisplay: function(qObj, ansOrd) {
                $('#qHolder').html(qObj.question);
                var abc = ['A','B','C','D'],
                    wrgLen = qObj.incorrect_answers.length,
                    ansIndx,                    
                    ansText;    
                for (var i=0; i<ansOrd.length; i++)
                {
                    ansIndx = ansOrd[i];
                    ansText = (ansIndx === wrgLen) ? 
                              qObj['correct_answer'] : 
                              qObj['incorrect_answers'][ansIndx];

                    $(`#ans${i+1}`).html(`${abc[i]}. ${ansText}`);
                }
                console.log(qObj);
                console.log(ansOrd);
            },
            nextQ: function() {
                this.qIndx ++;
            },
            showQ: function() {
                var self = this;
                self.setAnsOrder().then(
                    function(data) {
                        self.setQDisplay(data.qObj, data.ansOrd);
                });
            },
            isCorrect: function(ansText) {
                var self = this;
                return new Promise(
                    function(resolve, reject) {
                        try 
                        {
                            var qObj = self.qBank[self.qIndx];                            
                            resolve(qObj.correct_answer === ansText);
                        }
                        catch(e)
                        {
                            reject({Error: e});
                        }                        
                    });
            },    
        }

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
            });
    });
    
    $('.ansBtn').on('click', function(e) {
        if (game.status === 'waiting') //Only allow 1st click to register
        {
            game.status = 'selected';
            var ansText = e.target.innerText.slice(e.target.innerText.indexOf('.') + 2).trim(),
            thisBtnId = e.target.id;

            game.isCorrect(ansText).then(
                function(correct)
                {
                    console.log(`${(correct) ? 'Correct' : 'Incorrect'} answer selected.`)
                }
            )
        }
        
    });

    addOptions(); 
});
