function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalize(...args){
  var target=args[0]
  args.splice(0,1)
  var highest=0;
  var dimensions=[];
  args.forEach(element => {
    if(highest<element){
      highest=element
    }
  });
  args.forEach(element => {
    dimensions.push(element/highest*target)
  });
  return dimensions
}


function toRad(a){
  return (a * Math.PI) / 180
}

function calcS(v, angle){
  // return (v*v/(19.62*(Math.sin(toRad(angle))+f*Math.cos(toRad(angle))))).toFixed(4)
  return v*v/(19.62*(Math.sin(toRad(angle))+f*Math.cos(toRad(angle))))
}

function setInputFilter(textbox, inputFilter, errMsg) {
  [ "input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop", "focusout" ].forEach(function(event) {
    textbox.addEventListener(event, function(e) {
      if (inputFilter(this.value)) {
        // Accepted value.
        this.value=this.value.replace(",",".")
        if ([ "keydown", "mousedown", "focusout" ].indexOf(e.type) >= 0){
          this.classList.remove("input-error");
          this.setCustomValidity("");
        }

        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      }
      else if (this.hasOwnProperty("oldValue")) {
        // Rejected value: restore the previous one.
        this.classList.add("input-error");
        this.setCustomValidity(errMsg);
        this.reportValidity();
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      }
      else {
        // Rejected value: nothing to restore.
        this.value = "";
      }
    });
  });
}
