(function(){
    //0. make class
    class Notes{
        constructor(){
            this.list = [];
            this.num = 0;
            this.lastAdd;
            this.divisions = {};
        }

        add(Note){
            Note.id = this.num;
            this.list.push(Note);
            this.num++;
            this.lastAdd = Note;

            if(this.divisions[Note.division]===undefined){
                this.divisions[Note.division] = [];
                this.divisions[Note.division].push(Note.id);
            }else{
                this.divisions[Note.division].push(Note.id);
            }
            writeJson(this);
        }
    }
    
    class Note{
        constructor(string, date, division, postTime, tags=""){
            this.string = string;
            this.date = date;
            this.division = division;
            this.postTime = postTime;
            this.tags = [];
            for(var t of tags.split(" ")) this.tags.push(t);
            this.id = -1;
        }
    }
    var notes = new Notes();

    //1. add note
    //* date format function
    function dateToStr(date=new Date(), format) {
        if (!format) {
            format = 'Y/M/D h:m:s';
        }
        format = format.replace(/Y/g, date.getFullYear());
        format = format.replace(/M/g, (date.getMonth() + 1));
        format = format.replace(/D/g, date.getDate());
        format = format.replace(/h/g, date.getHours());
        format = format.replace(/m/g, date.getMinutes());
        format = format.replace(/s/g, date.getSeconds());
        return format;
    } 

    document.getElementById("add-button").addEventListener("click", function(){
        var string = $("#add-string").val();
        var date = dateToStr(new Date);   
        //var division = $("#add_division option:selected").text();
        var add_division = document.getElementById("add-division");
        var i = add_division.selectedIndex;
        var division = add_division.options[i].text;
        notes.add(new Note(string, date, division, Date.now()));
        appendNote(notes.lastAdd);
        console.log(notes.lastAdd);

        document.getElementById("add-string").value = "";
    }, false);


    //2. display note rom data
    //$("#field").append("<p class=\"field-content\"><span class=\"time\">"+);
    function appendNote(Note){
        var date = Note.date;
        var string = Note.string;
        var division = Note.division;
        $("#field").append(
            "<p class=\"field-content\">"
            +"<span class=\"time\">"+date
            +"</span><span class=\"note\">"+string+"</span>"
            +"</span><span class=\"division\">["+division+"]</span>"
        );

        generateNavigations(notes);
    }


    //2.5. Displaying setting class
    class Display{
        constructor(date, type, division){
            this.date = date;
            this.startDay;
            this.endDay;
            this.type = type;
            this.division = division;
            this.displayedDivisions = {};
        }
    }
    var display = new Display(dateToStr(), "Weekly", "diary");

    //3. click events
    function refresh(){
        $("#field").empty();
    }

    function generateFieldTitle(display){
        var date = display.date;
        var type = display.type;
        $("#field").append("<p class=\"field-title\"><span class=\"insight-date\">"+date+"</span><span class=\"insight-type\">:"+type+" Insight</span></p>");
    }

    function generateFieldContent(date, string, division){
        $("#field").append(
            "<p class=\"field-content\">"
            +"<span class=\"time\">"+date
            +"</span><span class=\"note\">"+string+"</span>"
            +"</span><span class=\"division\">"+division+"</span>"
        );
    }

    function generate(){
        return;
    }


    //4. generate navigation from Notes
    function generateNavigation(date, type, division){
        if(date!=null){
            //$("#navi-type").append("<a onclick=\"display.date="+date+"\"></a>");
        }
        if(type!=null){
            $("#navi-type").append("<li><a onclick=\"display.type="+type+"\">"+type+"</a></li>");
        }
        if(division!=null){
            var dom = $("<li><a href='#'"+division+"</a>"+division+"</li>");
            dom.click(function(){
                display.division = division;
                changeFiledView(display);
            });
            $("#navi-division").append(dom);
        }
    }

    var a = 0;
    document.getElementById("debug").addEventListener("click", function(n){
        a = n;
        console.log(a);
        console.log(display);
    })

    function generateNavigations(Notes){
        $("#navi-division").empty();
        display.displayedDivisions = {};
        for(var d in Notes.divisions){
            var dis = display.displayedDivisions[d];
            if(dis === undefined){
                display.displayedDivisions[d] = 1;
                generateNavigation(null, null, d);
            }
            else{
                display.displayedDivisions[d]++;
            }
        }
    }

    //5. change field view by clicking the navigation
    function changeFiledView(display){
        $("#field").empty();
        generateFieldTitle(display);
        var toDisplay = [];
        for(var n of notes.list){
            var flag = 0;
            //filter by date    

            //filter by division
            if(n.division === display.division){
                flag = 1;
            }
            else{
                flag = 0;
            }

            if(flag){
                appendNote(n);
            }
        }
    }

    //6. server access loading
    function getJson(urlIn) {
        $.ajax({ // json読み込み開始
            type: 'GET',
            url: urlIn,
            dataType: 'json'
        })
        .then(
            function(json) { // jsonの読み込みに成功した時
                var l = json.list;
                for(var i in l){
                    notes.add(l[i]);
                }
                writeJson(notes);
            },
            function() { //jsonの読み込みに失敗した時
                console.log('失敗');
            }
        );
    }

    function writeJson(notes){
        var text = JSON.stringify(notes);
        //ajax送信
        $.ajax({
            url : "ajax.php",
            type : "POST",
            dataType:"text",
            data : {"text": text},
            error : function(XMLHttpRequest, textStatus, errorThrown) {
                console.log("ajax通信に失敗しました");
            },
            success : function(response) {
                console.log("ajax通信に成功しました");
                //console.log(response[0]);
                //console.log(response[1]);
            }
        });
    }

    getJson("notes.json");
    
})();