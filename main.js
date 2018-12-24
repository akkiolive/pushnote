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
        console.log(notes);

        document.getElementById("add-string").value = "";
    }, false);


    //2. display note rom data
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
            this.data = start + " - " + end;
            this.type = type;
            this.division = division;
            this.displayedDivisions = {};
        }
    }
    var display = new Display(dateToStr(), "all", "app ideas");

    //3. click events
    function refresh(){
        $("#field").empty();
        changeFiledView(display);
    }

    function generateFieldTitle(display){
        var start = dateToStr(display.start, "Y/M/D");
        var end = dateToStr(display.end, "Y/M/D");
        var date = "";
        if(start === end) date = start;
        //else if(start.split('/')[0] === "1970") date = "All period"
        else if(display.type === "all") date = "All period";
        else date = start + " - " + end;
        var type = display.division;
        if(display.type === "all") type = "ALL"
        $("#field").append("<p class=\"field-title\"><span class=\"insight-date\">"+date+"</span><span class=\"insight-type\">:"+type+"</span></p>");
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
        generateFieldContent();
        var toDisplay = [];
        for(var n of notes.list){
            if(n === null) continue;
            var flag = 1;
            //filter by date    
            var p = Date.parse(n.date);
            var s = Date.parse(display.start);
            var e = Date.parse(display.end);
            if(s<=p && p<=e){
                console.log(s);
                console.log(p);
                console.log(e);
                flag = flag;
            }
            else{
                flag = 0;
            }

            //filter by division
            if(display.type != "all"){
                if(n.division === display.division){
                    flag = flag;
                }
                else{
                    flag = 0;
                }
            }

            if(flag){
                toDisplay.push(n);
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

    getJson("userdata/notes.json");

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
    
})();