//randomly generate questions using https://opentdb.com/api_config.php
$(document).ready(function(){
    var game = {
            gTime: 0,
            qIndx: 0,
            qBank: [],
            qOrder: [],    
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
            setUpQ: function() {
                var Q = this.qBank[this.qIndx],
                    num;
                this.qOrder = [];
                
                //Randomly generate order to load questions to form
                do{
                    num = Math.floor(Math.random() * 4)
                    if(this.qOrder.indexOf(num) === -1)
                    {
                        this.qOrder.push(num);
                    }
                }
                while(this.qOrder.length != 4);

                //Create function to fill question
            },    
        }

    var qSelect = app.smartSelect.create({
        closeOnSelect: true,
        el: '#qCount',
        on: {
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
          }
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
                //console.log(game.qBank);               
            });
    });
    
    addOptions(); 
});
