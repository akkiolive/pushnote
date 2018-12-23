(function(){
    //0. make class
    class Notes{
        constructor(){
            this.list = [];
            this.num = 0;
            this.lastAdd;
        }

        add(Note){
            Note.id = this.num;
            this.list.push(Note);
            this.num++;
            this.lastAdd = Note;
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
    function dateToStr24H(date, format) {
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
        var date = dateToStr24H(new Date);   
        //var division = $("#add_division option:selected").text();
        var add_division = document.getElementById("add-division");
        var i = add_division.selectedIndex;
        var division = add_division.options[i].text;
        notes.add(new Note(string, date, division, Date.now()));
        console.log(notes.lastAdd);
        appendNote(notes.lastAdd);
    }, false);


    //2. display note rom data
    //$("#field").append("<p class=\"field-content\"><span class=\"time\">"+);
    function appendNote(Note){
        var date = Note.date;
        var string = Note.string;
        $("#field").append("<p class=\"field-content\"><span class=\"time\">"+date+"</span><span class=\"note\">"+string+"</span>");
    }

    //3. click events
})();