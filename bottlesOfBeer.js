/*
 * bottlesOfBeer : 
 * @version 2015-08-11 00:49
 * @author Steven Hollingsworth <steven.hollingsworth@fresno.gov>
 */
'use strict';
var Bottles = (function() {
   var body;

   var Bottles = {
      'bottleType':'Beer',
      'full':"./images/beer.png",
      'empty':"./images/beer_done.png",
      'maxSongLines':2,
      'currentSongLine':0,
      'timeLeft':0,
      'bottleCount':100,
      'tempoDuration':600,
      'tempoSpeed':1,
      'tempoBlock':[
         '{{cnt}}',
         'Bottles of',
         '{{type}} on the',
         'wall',
         '{{cnt}}',
         'Bottles of',
         '{{type}}',
         '',
         'Take one',
         'down',
         'pass it',
         'around'
      ],
      'lastBlock':[
         'no more',
         'Bottles of',
         '{{type}} on the',
         'wall!'
      ]
   };

   function newForm(data) {
      var types = data.types;
      var fields = data.fields;
      var div = $("<div/>");
      var name = FormEl.getText('name','Attribute Name');
      name.find("input").attr('size',50);
      var desc = FormEl.getText('description','Attribute Description');
      name.find("input").attr('size',250);
      var mult_config = {};
      mult_config.values = [];
      mult_config.values.push({
         'desc':'Yes',
         'val':1
      });
      mult_config.values.push({
         'desc':'No',
         'val':0
      });
      mult_config.default_value = 0;
      mult_config.name = 'multiple';
      mult_config.desc = 'Can Have Multiple Values';
      var multiple = FormEl.getRadio(mult_config);
      var types_fg = $("<div/>",{
         'class':'form-group'
      });
      var types_select = $("<select/>",{
         id:'types',
         'class':'form-control'
      });
      var types_label = FormEl.getLabel('types','Type');
      types_fg.append([types_label,types_select]);
      $.each(types,function(val,desc){
         var opt = $("<option/>",{
            html:desc,
            value:val
         });
         types_select.append(opt);
      });
      var types_desc = FormEl.getLabel('types','Type');
      div.append([name,desc,multiple,types_fg]);
      $('#blarg').append(div);
      console.log(data);
   }

   function getStanza(cnt,type) {
      var replace = {};
      replace.type = type;
      replace.cnt = cnt;
      var retarr = [];
      var block;
      if(cnt === 0) {
         block = Bottles.lastBlock;
      } else {
         block = Bottles.tempoBlock;
      }
      $.each(block,function(i,line){
         var re = /\{\{(.*)\}\}/g;
         var arr = re.exec(line);
         if(arr !== null) {
            var repl = arr[1];
            line = line.replace(re,replace[repl],"$0");
         }
         if(cnt === 1) line = line.replace(/Bottles/,'Bottle');
         retarr.push(line);
      });
      return retarr;
   }
   function getCurrentStatus(cnt,type) {
      return cnt+" Bottles of "+type+" on the wall";
   }
   function setTimeLeft() {
      var dur = moment.duration(Bottles.timeLeft);
      var units = [
         'years',
         'months',
         'days',
         'hours',
         'minutes',
         'seconds'
      ];
      var display = [];
      $.each(units,function(i,unit){
         var x = dur.get(unit);
         if(x) {
            if(x === 1) unit = unit.replace(/s$/,'');
            display.push(x+" "+unit);
         }
      });
      //add 'and' 
      if(display.length > 1) {
         var last = display.pop();
         display.push('and');
         display.push(last);
      }
      var left = display.join(" ");
      if(display.length === 0) {
         $("#timer").html('Finished!');
      } else {
         $("#timer").html('Will finish in: '+left);
      }
   }
   function checkSongLine() {
      Bottles.currentSongLine++;
      if(Bottles.currentSongLine > Bottles.maxSongLines) {
         $("#song").children().first().fadeOut(6000,function(){
            $(this).remove();
            Bottles.currentSongLine--;
         });
      }
   }
   function setQueue() {
      var cnt = Bottles.bottleCount;
      var type = Bottles.bottleType;
      Bottles.timeLeft = 0;
      body.queue('Queue',[]).stop();
      var durationCounter = 0;
      var queue = [];
      while(cnt >= 0) {
         var stan = getStanza(cnt,type);
         var title = getCurrentStatus(cnt,type);
         queue.push({
            stanza:stan,
            title:title
         });
         cnt--;
      }
      $.each(queue,function(i,set){
         var stanza = set.stanza;
         var title = set.title;
         var img = $("<img/>");
         var songline = $("<div/>");
         $("#song").append(songline);
         img.attr('title',Bottles.bottleType+" #"+i);
         if(i !== 0) {
            img.attr('src',Bottles.full);
            img.attr('width',50);
            img.attr('height',75);
            img.appendTo("#drink");
         }
         body.queue('Queue', function(){ 
            checkSongLine();
            Bottles.bottleCount--;
            setTimeLeft();
            $('title').html(title);
            if(i !== 0) {
               img.appendTo("#drunk");
               img.attr('src',Bottles.empty);
               img.attr('width',90);
               img.attr('height',40);
            }
            $(this).dequeue('Queue');
         });
         $.each(stanza,function(z,line){
            Bottles.timeLeft += Bottles.tempoDuration;
            body.queue('Queue', function(){ 
               Bottles.timeLeft -= Bottles.tempoDuration;
               songline.append(line,'&nbsp;');
               $(this).dequeue('Queue');
            }).delay(Bottles.tempoDuration,'Queue');
         });
      });
      //last
      body.queue('Queue', function(){
         Bottles.timeLeft = 0;
         setTimeLeft();
      });
      body.dequeue('Queue');
   }

   Bottles.init = function init() {
      body = $('body');
      setQueue();
   };
   return Bottles;
})();

