var editors = [];
var inputs = ["vendor_search","vul_report","vul_report","vul_coordinate",
	      "vul_remediate","vul_notice"]
var feeds = ["stakeholders"]
var outputs = ["report_methods","vul_report","vul_coordinate",
	       "vul_remediate","vul_notice","vul_metrics"]
var steps = ["discover","report","triage","remediate","public_awareness",
	     "deployment"]

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
    var schema_url = "../schema/"+a.id;
    $.getJSON(schema_url).done(function(f) {
	var xindex = parseInt(a.getAttribute('jindex'))*2 + offset;
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
function perform_action(input_editor,output_editor,input_div,output_div) {
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
    input_editor.oldValue = ijraw
    $('#processing').html("Processing").removeClass("d-none");
    $(output_div).css({opacity: 0.3});
    $.ajax({
	url: "../machine/"+steps[input_editor.jindex]+".py",
	contentType: "application/json",
	dataType: "json",
	data: ijraw,
	type: "POST"
    }).done(function(d) {
	var ojson = JSON.parse(output_editor.getValue());
	output_editor.setValue(pretty_json(d));
	make_alert("Update in progress","success");
	//make_alert("Updated output with "+ojson[getvar].length+" "+
	//	   getvar+" entries!","success");
    }).always(function() {
	$('#processing').fadeOut().addClass("d-none").fadeIn();
	$(output_div).css({opacity: 1});
    }).fail(function() {
	console.log(arguments);
	make_alert("Failed to fetch data for output","danger");
	    
    })

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
	    url: "../data/"+inputs[i]+".json",
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
	    url: "../data/"+outputs[i]+".json",
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
	    perform_action(input_editor,output_editor,input_div,output_div);
	} else {
	    console.log(e.target); // newly activated tab
	    console.log(e.relatedTarget); // previous active tab
	    return
	}

    });
});




