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

    $("#add-division").select2();

    function postNote(){
        var string = $("#add-string").val();
        var date = dateToStr(new Date);   
        //var division = $("#add_division option:selected").text();
        var add_division = document.getElementById("add-division");
        var i = add_division.selectedIndex;
        var division = add_division.options[i].text;
        notes.add(new Note(string, date, division, Date.now()));
        //appendNote(notes.lastAdd);
        refresh();
        console.log(notes);

        document.getElementById("add-string").value = "";
    }

    document.getElementById("add-string").addEventListener("keydown", function(e){
        if(e.ctrlKey && e.keyCode==13) postNote();
    }, false);
    document.getElementById("add-button").addEventListener("click", postNote, false);


    //2. display note from data
    //$("#field").append("<p class=\"field-content\"><span class=\"time\">"+);
    function appendNote(Note){
        var date = Note.date;
        var string = Note.string;
        var division = Note.division;
        var mc = $("#main-content");
        var fc = $(
            "<li class=\"field-content\">"
            +"<div class=\"time\">"+date
            +"</div><div class=\"note\">"+string+"</div>"
            +"</div><div class=\"division\">["+division+"]</div>"
            +'<br /><div class="content-control" style="visibility:hidden"></div>'
            +"</li>"
        );
        mc.append(fc);
        
        var edit = $('<a>', {href: "#", text: "Edit"});
        edit.click(function(){
            return; //TODO
        });
        var del = $('<a>', {href: "#", text: "Delete"});
        del.click(function(){
            console.log(notes);
            console.log(Note);
            for(var i in notes.list){
                if(notes.list[i].postTime === Note.postTime){
                    notes.list.splice(i, 1);
                    writeJson(notes);
                    console.log(notes.list[i]);
                }
            }
            refresh();
            return; //TODO
        });

        var cc = fc.children(".content-control")
        cc.append(edit);
        cc.append(del);

        fc.hover(function(){
            cc.css("visibility", "visible");
        },
        function(){
            cc.css("visibility", "hidden");
        });

        generateNavigations(notes);
    }


    //2.5. Displaying setting class
    class Display{
        constructor(date, type, division){
            this.start = new Date(1970, 1, 1);
            this.end = new Date(2100, 1, 1);
            var start = dateToStr(start, "Y/M/D");
            var end = dateToStr(end, "Y/M/D");
            this.date = start + " - " + end;
            this.type = type;
            this.typeDivision = "all"; //decide displaying all or each division
            this.typePeriod = "all"; //decide displaying period
            this.division = division;
            this.displayedDivisions = {};
            this.sort  = "newest";
        }

        setDisplayTime(){
            this.end = new Date();
            this.start = new Date();
            if(this.typePeriod === "year"){
                this.start.setMonth(0);
                this.start.setDate(1);
                this.start.setHours(0);
                this.start.setMinutes(0);
                this.start.setSeconds(0);
                this.end.setMonth(12);
                this.end.setDate(1);
                this.end.setHours(0);
                this.end.setMinutes(0);
                this.end.setSeconds(0);            }
            else if(this.typePeriod === "month"){
                this.start.setDate(1);
                this.start.setHours(0);
                this.start.setMinutes(0);
                this.start.setSeconds(0);
                this.end.setMonth(this.end.getMonth()+1);
                this.end.setDate(0);
                this.end.setHours(0);
                this.end.setMinutes(0);
                this.end.setSeconds(0);            
            }
            else if(this.typePeriod === "day"){
                this.start.setHours(0);
                this.start.setMinutes(0);
                this.start.setSeconds(0);
                this.end.setHours(23);
                this.end.setMinutes(59);
                this.end.setSeconds(59);
            }
            else if(this.typePeriod === "hour"){
                this.start.setHours(this.end.getHours() - 1);
            }
            else if(this.typePeriod === "minute"){
                this.start.setMinutes(this.end.getMinutes() - 1);
            }
            //console.log(this.start);
            //console.log(this.end);
        }
    }
    var display = new Display(dateToStr(), "all", "app ideas");

    //3. click events
    function refresh(){
        $("#field").empty();
        display.setDisplayTime();
        changeFiledView(display);
        generateDivisionButtons(notes);
        generateDivisionSelectOptions(notes);
        generatePeriodNavigation();
    }

    function generateFieldTitle(display){
        var start = dateToStr(display.start, "Y/M/D");
        var startYear = dateToStr(display.start, "Y");
        var end = dateToStr(display.end, "Y/M/D");
        var date = "";
        if(start === end) date = start;
        if(display.typePeriod === "all" || startYear==="1970") date = "All period";
        else if(display.typePeriod === "year") date = startYear+"/1/1 - "+startYear+"/12/31";
        else if(display.typePeriod === "day") date = start;
        else if(display.typePeriod === "hour") date = "last 1 hour";
        else if(display.typePeriod === "minute") date = "last 1 minute";
        else date = start + " - " + end;
        var type = display.division;
        if(display.typeDivision === "all") typeDivision = "ALL" 
        else typeDivision = display.division;
        $("#field").append("<p class=\"field-title\"><span class=\"insight-type\">"+typeDivision+"</span><span class=\"insight-date\">:"+date+"</span></p>");
    }

    function generateFieldContent(date, string, division){
        $("#field").append(
            "<ul class='field-content' id='main-content'></ul>"
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
                if(division === "all"){
                    display.typeDivision = "all";
                }
                else{
                    display.typeDivision = "division";  
                }
                changeFiledView(display);
            });
            $("#navi-division").append(dom);
        }
    }

    function generateNavigations(Notes){
        $("#navi-division").empty();
        //link to all
        generateNavigation(null, null, "all");

        //each
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

    function generateDivisionButtons(notes){
        $("#division-select-buttons").empty();
        for(var d in notes.divisions){   
            var btn = $("<button class='division-select-button square_btn'>"+d+"</button>")
            btn.click(function(){
                setAddDivision(d);
            });
            $("#division-select-buttons").append(btn);
        }
    }

    function pushDivisionToOption(division){
        $("#add-division").append("<option value='"+division+"'>"+division+"</option>");    
    }

    function generateDivisionSelectOptions(notes){
        $("#add-division").empty();
        for(var d in notes.divisions){
            pushDivisionToOption(d);
        }
    }

    function setAddDivision(division){
        $("#add-division").val(division);
        $('#add-division').trigger('change');
    }

    function addDivisionFromInput(){
        var text = document.getElementById("push-division-text").value;
        if(text==="") return;
        if(!notes.divisions[text]){
            notes.divisions[text] = [];
            pushDivisionToOption(text);
        }
        $("#add-division").val(text);
        $('#add-division').trigger('change');
        document.getElementById("push-division-text").value = "";
    }

    document.getElementById("push-division-text").addEventListener('keydown', function(e){
        if(e.keyCode != 13) return; //enter key
        addDivisionFromInput();
    }, false);

    function addPeriodNavigation(text, period){
        var li = $("<li><a href='#'>"+text+"</a></li>");
        li.click(function(){
            display.typePeriod = period;
            display.setDisplayTime();
            changeFiledView(display);
        });
        $("#navi-period").append(li);
    }

    function generatePeriodNavigation(){
        $("#navi-period").empty();
        addPeriodNavigation("all", "all");
        addPeriodNavigation("year", "year");
        addPeriodNavigation("month", "month");
        addPeriodNavigation("day", "day");
        addPeriodNavigation("hour", "hour");
        addPeriodNavigation("minute", "minute");
        addPeriodNavigation("custom", "custom");    
    }

    var a = 0;
    document.getElementById("debug").addEventListener("click", function(n){
        a = n;
        console.log(a);
        console.log(display);
    })

    //5. change field view by clicking the navigation
    function changeFiledView(display){
        $("#field").empty();
        generateFieldTitle(display);
        generateFieldContent();
        var toDisplay = [];
        for(var n of notes.list){
            if(n === null) continue;
            var flag = 1;
            //filter by date    
            if(display.typePeriod === "all"){
                flag = flag;
            }
            else{
                var p = Date.parse(n.date);
                var s = Date.parse(display.start);
                var e = Date.parse(display.end);
                if(s<=p && p<=e){
                    flag = flag;
                }
                else{
                    flag = 0;
                    //console.log(s);
                    //console.log(p);
                    //console.log(e);
                }
            }

            //filter by division
            if(display.typeDivision != "all"){
                if(n.division === display.division){
                    flag = flag;
                }
                else{
                    flag = 0;
                }
            }

            if(flag){
                toDisplay.push(n);
            }
        }

        //sort
        var dict = {};
        for(var i in toDisplay){
            dict[i] = toDisplay[i].postTime;
        }
        function object_array_sort(data,key,order,fn){
            //デフォは降順(DESC)
            var num_a = -1;
            var num_b = 1;
        
            if(order === 'asc'){//指定があれば昇順(ASC)
              num_a = 1;
              num_b = -1;
            }
        
           data = data.sort(function(a, b){
              var x = a[key];
              var y = b[key];
              if (x > y) return num_a;
              if (x < y) return num_b;
              return 0;
            });
        
           fn(data); // ソート後の配列を返す
          }
        if(display.sort === "newest"){
            object_array_sort(toDisplay, 'id', '', function(new_data){
                //ソート後の処理
            //    console.log(new_data); //
            }); 
        }

        for(var i in toDisplay){
            appendNote(toDisplay[i]);
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
                //writeJson(notes);
                refresh();
            },
            function() { //jsonの読み込みに失敗した時
                console.log('読み込み失敗');
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
                console.log("書き込みに失敗しました");
            },
            success : function(response) {
                console.log("書き込みに成功しました");
                //console.log(response[0]);
                //console.log(response[1]);
            }
        });
    }

    getJson("getJson.php");

    //note control actions
    var content_string = document.getElementsByClassName("string");
    var content_controls = document.getElementsByClassName("content-control");
    for(var c of content_string){
        c.addEventListener('mouseenter', () =>{
            c.style.visibility = "visible";
        }, false);
        c.addEventListener('mouseleave', () =>{
            c.style.visibility = "hidden";
        }, false);
    }

    //interval
    setInterval(refresh, 1000);
    
})();