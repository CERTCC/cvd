var editors = [];
var inputs = ["vendor_search","vul_report","vul_report","vul_coordinate",
	      "vul_remediate","vul_notice"]
var feeds = ["stakeholders"]
var outputs = ["report_methods","vul_report","vul_coordinate",
	       "vul_remediate","vul_notice","vul_metrics"]
var steps = ["Discover","Report","Triage","Remediate","Public_Awareness",
	 "Deployment"]

function pretty_json(j) {
    return JSON.stringify(j,null,'\t');
}
function clear_schema() {
    $('ul.nav-tabs').css({opacity:1.0,'pointer-events':'initial'});
    if($('div.show.active').find(".active").hasClass("input-tab"))
	$('.ischema').removeClass("d-none");
    else
	$('.oschema').removeClass("d-none");	
    var s_editor = $('div.show.active  div.show.active').find(".editor");
    if(s_editor.length == 1) {
	var current_editor = s_editor[0].env.editor;
	current_editor.setValue(current_editor.oldValue);
    }
    $(".hide-schema").toggleClass("d-none");    
}
function load_schema(a,offset) {
    var schema_url = a.id;
    $.getJSON(schema_url).done(function(f) {
	var xindex = parseInt(a.getAttribute('jindex')) + offset;
	a.classList.add("d-none");
	$(".hide-schema").toggleClass("d-none");
	editors[xindex].setValue(pretty_json(f));
	$('ul.nav-tabs').css({opacity:0.5,'pointer-events':'none'});
	$(".ischema,.oschema")
    }).fail(function() {
	console.log(arguments);
	make_alert("Schema is not available, probaly not yet ready!","danger");
    })

}
function perform_action(input_editor,output_editor) {
    var ijraw = input_editor.getValue();
    $(".oschema").removeClass("d-none");
    $(".ischema").addClass("d-none");    
    if(('oldValue' in input_editor) && (ijraw == input_editor.oldValue)) {
	$('#processing').html("No changes").removeClass("d-none");
	setTimeout(function() {
	    $('#processing').fadeOut().addClass("d-none").fadeIn();
	},2000);
	return;
    }
    $('#processing').html("Processing").removeClass("d-none");
    if(('jindex' in input_editor) && (feeds[input_editor.jindex])) {
	var ijson = JSON.parse(ijraw);
	var getvar = feeds[input_editor.jindex];
	input_editor.oldValue = ijson;
	$.getJSON(getvar+".json").done(function(d) {
	    var ojson = JSON.parse(output_editor.getValue())
	    ojson['inputs'] = ijson['search'];
	    if(('title' in ijson) && ('title' in ojson))
		ojson.title = "Results for "+ijson.title+", using CERT API";
	    ojson[getvar] = [];
	    for(var i=0; i < d.length; i++) {
		if(('default' in d[i]) && (d[i]['default'] == true)) {
		    ojson[getvar].push(d[i][getvar]);
		} else if('search' in ijson) {
		    for(var j = 0; j < ijson.search.length; j++) {
			var skeys = ijson.search[j];
			var ik = Object.keys(skeys);
			var match = true;
			for(var k = 0; k < ik.length; k++) {
			    var dkey = ik[k]
			    if(skeys[dkey].toLowerCase() == d[i][dkey].toLowerCase())
				match = match && true;
			    else
				match = false;
			}
		    /* Everything matches add this entry to output json*/
		    if(match)
			ojson[getvar].push(d[i][getvar]);
		    }
		}
	    }
	    output_editor.setValue(pretty_json(ojson));
	    make_alert("Updated output with "+ojson[getvar].length+" "+
		       getvar+" entries!","success");
	}).always(function() {
	    $('#processing').fadeOut().addClass("d-none").fadeIn();	    
	}).fail(function() {
	    console.log(arguments);
	    make_alert("Failed to fetch data for output","danger");
	})
    }

}

function editor_updates(_,editor) {
    if (editor.curOp && editor.curOp.command.name) {
	console.log("user change");
    }
} 
function make_alert(txt,lvl) {
    /* lvls can be primary,secondary,success,danger,warning,info,light,dark */
    $('#alerter').removeClass().html(txt).
	addClass("alert alert-"+lvl).fadeIn().fadeOut(9000)
}
$(function() {
    var isactive="active";
    var truefalse="true";
    var showactive = "show active"
    for(var i = 0; i< steps.length; i++ ) {
	var dname = steps[i];
	$("<li>").addClass("nav-item").append(
	    $("<a>").attr({
		"data-toggle": "tab",
		"role": "tab",
		"class": "nav-link top-nav "+isactive,
		"id": dname+"-tab",
		"href": "#"+dname,
		"aria-controls": dname,
		"aria-selected": truefalse
	    }).html(dname)).appendTo("#maintabul")
	$("<div>").addClass("tab-pane fade "+showactive).attr({
	    "id": dname,
	    "role": "tabpanel",
	    "aria-labelledby": dname+"-tab"}).appendTo("#maintabdiv")
	$("<ul>").addClass("nav nav-tabs").attr("role","tablist").append(
	    $("<li>").addClass("nav-item").append(
		$("<a>").attr({
		    "data-toggle": "tab",
		    "role": "tab",
		    "class": "nav-link active input-tab",
		    "id": dname+"-1-tab",
		    "href": "#"+dname+"-1",
		    "aria-controls": dname+"-1",
		    "aria-selected": truefalse}).html("Input")),
	    $("<li>").addClass("nav-item").append(	
		$("<a>").attr({
		    "data-toggle": "tab",
		    "role": "tab",
		    "class": "nav-link output-tab",
		    "id": dname+"-2-tab",
		    "href": "#"+dname+"-2",
		    "aria-controls": dname+"-2",
		    "aria-selected": truefalse}).html("Output")))
	    .appendTo("#"+dname);
	$("<div>").addClass("tab-pane fade show active adapt").attr({
	    "id": dname+"-1",
	"role": "tabpanel",
	    "aria-labelledby": dname+"-1-tab"}).appendTo("#"+dname);
	$("<div>").addClass("tab-pane fade adapt").attr({
	    "id": dname+"-2",
	    "role": "tabpanel",
	    "aria-labelledby": dname+"-2-tab"}).appendTo("#"+dname);
	truefalse = "false";
	isactive = "";
	showactive = ""
	$("<div>").attr({id: dname+"-1-content"}).addClass("editor")
	    .appendTo("#"+dname+"-1");
	$("<div>").attr({id: dname+"-2-content"}).addClass("editor")
	    .appendTo("#"+dname+"-2");
	$("#"+dname).append($("<a>").attr({
	    "class": "ischema float-left btn btn-info",
	    id: inputs[i]+".schema.json",
	    jindex: i,
	    title: "Input Schema",
	    onclick: "load_schema(this,0)"
	}).html("Input Schema"));
	$("#"+dname).append($("<a>").attr({
	    jindex: i,
	    "class": "hide-schema d-none btn btn-danger",
	    title: "Hide Schema",
	    onclick: "clear_schema()"
	}).html("Hide Schema"));
	$("#"+dname).append($("<a>").attr({
	    "class": "oschema d-none float-right btn btn-info",
	    id: outputs[i]+".schema.json",
	    jindex: i,
	    title: "Output Schema",
	    onclick: "load_schema(this,1)"
	}).html("Output Schema"));

	var editor = ace.edit(dname+"-1-content");
	editor.setTheme("ace/theme/monokai");
	editor.session.setMode("ace/mode/json");
	editor.session.setUseWrapMode(true);
	editor.json_feed = inputs[i]+".json";
	editor.jindex = i;
	editors.push(editor);		
	$.ajax({
	    url: inputs[i]+".json",
	    Editor: editor,
	    success: function(d) {
		var jsonpayload = pretty_json(d);
		this.Editor.setValue(jsonpayload);
		this.Editor.oldValue = jsonpayload;
	    },
	    error: function() {
		this.Editor.setValue("{}");
	    }
	}).always(function() {
	    //this.Editor.on("change",editor_updates);
	})
	var editoro = ace.edit(dname+"-2-content");
	editoro.setTheme("ace/theme/monokai");
	editoro.session.setMode("ace/mode/json");
	editoro.session.setUseWrapMode(true);
	editoro.json_feed = outputs[i]+".json";	
	editoro.setReadOnly(true)
	$.ajax({
	    url: outputs[i]+".json",
	    Editor: editoro,
	    success: function(d) {
		var jsonpayload = pretty_json(d);		
		this.Editor.setValue(jsonpayload);
		this.Editor.oldValue = jsonpayload;		
	    },
	    error: function() {
		this.Editor.setValue("{}");
	    }
	}).always(function() {
	    //this.Editor.on("change",editor_updates);
	    
	})
	editors.push(editoro);
    }
    $('.top-nav').on('shown.bs.tab', function (e) {
	var etarget = $(e.target).attr("href");
	if ($(etarget).find(".active").hasClass("output-tab"))  { 
	    $(".ischema").addClass("d-none");
	    $(".oschema").removeClass("d-none");
	} else {
	    $(".ischema").removeClass("d-none");
	    $(".oschema").addClass("d-none");
	}
    });    
    $('.input-tab').on('shown.bs.tab', function (e) {
	$(".ischema").removeClass("d-none");
	$(".oschema").addClass("d-none");	
    });
    $('.output-tab').on('shown.bs.tab', function (e) {
	var output_div = $(e.target).attr("href");
	var input_div = $(e.relatedTarget).attr("href");
	var input_ace = $(input_div).find(".editor")[0];
	var output_ace = $(output_div).find(".editor")[0];
	if((typeof(input_ace) == "undefined") ||
	   (typeof(output_ace) == "undefined")) {
	    console.log("Error could not find right source and target ");
	    return;
	}
	if(('env' in input_ace) && ('env' in output_ace)) {
	    var input_editor = input_ace.env.editor;
	    var output_editor = output_ace.env.editor;
	    perform_action(input_editor,output_editor);
	} else {
	    console.log(e.target); // newly activated tab
	    console.log(e.relatedTarget); // previous active tab
	    return
	}

    });
});




