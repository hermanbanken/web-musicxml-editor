function switchToNoteMode() {
  editor.mode = 'note';
  editor.svgElem.addEventListener('mousemove', redrawMeasureWithCursorNote, false);
}

function switchToMeasureMode() {
  editor.mode = 'measure';
  editor.svgElem.removeEventListener('mousemove', redrawMeasureWithCursorNote, false);
}

// draws note, which is to be added, below mouse cursor when it is
// moving in column of selected note(only rest currenly)
function redrawMeasureWithCursorNote(event) {
  // get mouse position
  editor.mousePos.current = getMousePos(editor.svgElem, event);

  // get selected measure and note
  var mnId = editor.selected.note.id;
  var measureIndex = mnId.split('n')[0].split('m')[1];
  var noteIndex = mnId.split('n')[1];
  var vfStaveNote = vfStaveNotes[measureIndex][noteIndex];
  var vfStave = vfStaves[measureIndex];

  // currently support only for replacing rest with a new note
  // building chords feature will be added soon
  if(!vfStaveNote.isRest()) return;

  // get column of selected note on stave
  var bb = vfStave.getBoundingBox();
  var begin = vfStaveNote.getNoteHeadBeginX() - 5;
  bb.setX(begin);
  bb.setW(vfStaveNote.getNoteHeadEndX() - begin + 5);
  // bb.setW(20);
  // bb.draw(editor.ctx);

  // mouse cursor is within note column
  if(isCursorInBoundingBox(bb, editor.mousePos.current) ) {
    // save mouse position
    editor.mousePos.previous = editor.mousePos.current;
    // get new note below mouse cursor
    editor.selected.cursorNoteKey = getCursorNoteKey();
    
    editor.svgElem.addEventListener('click', editor.add.note, false); 

    // redraw only when cursor note changed pitch
    // (mouse changed y position between staff lines/spaces)
    if(editor.lastCursorNote !== editor.selected.cursorNoteKey) {
      // console.log(editor.selected.cursorNoteKey);
      editor.draw.selectedMeasure(true);


// TODO after click replace selected rest with cursor note and highlight it
  // (implement add note for this)

    }
    // save previous cursor note for latter comparison
    editor.lastCursorNote = editor.selected.cursorNoteKey;
  }
  // mouse cursor is NOT within note column
  else {

    editor.svgElem.removeEventListener('click', editor.add.note, false); 

    // mouse cursor just left note column(previous position was inside n.c.)
    if(isCursorInBoundingBox(bb, editor.mousePos.previous) ) {
      // redraw measure to erase cursor note
      editor.draw.selectedMeasure(false);
      editor.mousePos.previous = editor.mousePos.current;
      editor.lastCursorNote = '';
    }
  }

}

function getMousePos(canvas, evt) {
var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function getRadioValue(name) {
  var radios = document.getElementsByName(name);
  for(var i = 0; i < radios.length; i++)
    if(radios[i].checked)
      return radios[i].value;
}

/*
TODO: documentary comment...
*/
// TODO rewrite with use of vfStave.getLineForY(editor.mousePos.current.y)
function getCursorNoteKey() {
  // find the mouse position and return the correct note for that position.
  var y = vfStaves[editor.selected.measure.id.split('m')[1]].y;
  // var y = editor.selected.measure.y;
  var notesArray = ['c/','d/','e/','f/','g/','a/','b/'];
  var count = 0;

  var checkboxValue = $('#dotted-checkbox').is(":checked");
  var d = checkboxValue ? 'd' : '';

  for(var i = 5; i >= 0; i--){
    for(var l = 0; l < notesArray.length; l++){
      var noteOffset = (count * 35) - (l * 5 - 17);
      if(editor.mousePos.current.y >= y + noteOffset && editor.mousePos.current.y <= 5 + y + noteOffset){
        var cursorNoteKey = notesArray[l] + (i+1) + d;
        var found = true;
        break;
      }
      if(found == true){
        break;
      }
    }
    count++;
  }
  return cursorNoteKey;
}

function isCursorInBoundingBox(bBox, cursorPos) {
  return cursorPos.x > bBox.getX() && cursorPos.x < bBox.getX() + bBox.getW() &&
         cursorPos.y > bBox.getY() && cursorPos.y < bBox.getY() + bBox.getH();
};


// for TODO in delete.js on line 10 use one of these functions:

/**
 * @param obj1 The first object
 * @param obj2 The second object
 * @returns A new object representing the merged objects. If both objects passed as param have the same prop, then obj2 property is returned.
 */
// author Andre Bakker, VexUI: https://github.com/andrebakker/VexUI
function mergeProperties(obj1, obj2){
  var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

// or use this from vexflow:

// Merge `destination` hash with `source` hash, overwriting like keys
// in `source` if necessary.
// function mergeProperties(destination, source) {
//   for (var property in source)
//     destination[property] = source[property];
//   return destination;
// };