QUnit.module('font');

QUnit.test("Font constructor empty", function(assert) {
	var font = new $.fontpicker.Font;
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);
});

QUnit.test("Font constructor font-family", function(assert) {
	var font = new $.fontpicker.Font(' font-family : Arial ; ');
	assert.equal(font.getCss(), 'font-family:Arial');
	assert.equal(font.set, false);
	
	var font = new $.fontpicker.Font(' font-family : foobar ; ');
	assert.equal(font.getCss(), 'font-family:foobar');
	assert.equal(font.set, false);	
});

QUnit.test("Font constructor font-size", function(assert) {
	var font = new $.fontpicker.Font(' font-size : 123px ; ');
	assert.equal(font.getCss(), 'font-size:123px');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' font-size : foobar ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);
	
});

QUnit.test("Font constructor color", function(assert) {
	var font = new $.fontpicker.Font(' color : black ; ');
	assert.equal(font.getCss(), 'color:rgb(0, 0, 0)');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' color : foobar ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
});

QUnit.test("Font constructor line-height", function(assert) {
	var font = new $.fontpicker.Font(' line-height : normal ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' line-height : 100% ; ');
	assert.equal(font.getCss(), 'line-height:100%');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' line-height : 200% ; ');
	assert.equal(font.getCss(), 'line-height:200%');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' line-height : 111% ; ');
	assert.equal(font.getCss(), 'line-height:111%');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' line-height : 2 ; ');
	assert.equal(font.getCss(), 'line-height:200%');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' line-height : foobar ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
});

QUnit.test("Font constructor text-decoration", function(assert) {
	var font = new $.fontpicker.Font(' text-decoration : none ; ');	
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' text-decoration : underline ; ');	
	assert.equal(font.getCss(), 'text-decoration:underline');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' text-decoration : foobar ; ');	
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
});

QUnit.test("Font constructor font-weight", function(assert) {
	var font = new $.fontpicker.Font(' font-weight : normal ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' font-weight : bold ; ');
	assert.equal(font.getCss(), 'font-weight:bold');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' font-weight : foobar ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
});

QUnit.test("Font constructor font-style", function(assert) {
	var font = new $.fontpicker.Font(' font-style : normal ; ');	
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' font-style : italic ; ');	
	assert.equal(font.getCss(), 'font-style:italic');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' font-style : foobar ; ');	
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
});

QUnit.test("Font constructor font-variant", function(assert) {
	var font = new $.fontpicker.Font(' font-variant : normal ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' font-variant : small-caps ; ');
	assert.equal(font.getCss(), 'font-variant:small-caps');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' font-variant : foobar ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
});

QUnit.test("Font constructor letter-spacing", function(assert) {
	var font = new $.fontpicker.Font(' letter-spacing : normal ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' letter-spacing : 2px ; ');
	assert.equal(font.getCss(), 'letter-spacing:2px');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' letter-spacing : foobar ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
});

QUnit.test("Font constructor multiple", function(assert) {
	var font = new $.fontpicker.Font(' font-family : Arial ; font-variant: small-caps ; ');
	assert.equal(font.getCss(), 'font-family:Arial;font-variant:small-caps');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' font-family : Arial ; font-variant: normal ; ');
	assert.equal(font.getCss(), 'font-family:Arial');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' font-family : Arial ; font-variant: foobar ; ');
	assert.equal(font.getCss(), 'font-family:Arial');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' letter-spacing : normal ; font-variant: foobar ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
	
	var font = new $.fontpicker.Font(' letter-spacing : foobar ; font-variant: foobar ; ');
	assert.equal(font.getCss(), '');
	assert.equal(font.set, false);	
});

QUnit.test("Font constructor equals", function(assert) {
	var font = new $.fontpicker.Font(' font-family : Arial ; font-variant: small-caps ; ');
	assert.ok(font.equals(font));
	assert.equal(font.set, false);	
	
	var same = new $.fontpicker.Font('font-variant: small-caps ;  font-family : Arial  ');	
	assert.equal(same.set, false);	
	assert.ok(font.equals(same));
	assert.ok(same.equals(font));
	
	var different = new $.fontpicker.Font('font-variant: small-caps ;  font-family : Verdana  ');
	assert.equal(different.set, false);	
	assert.notOk(font.equals(different));
	assert.notOk(different.equals(font));
});

QUnit.test("Font constructor copy", function(assert) {
	var font = new $.fontpicker.Font(' font-family : Arial ; font-variant: small-caps ; ');
	assert.equal(font.getCss(), 'font-family:Arial;font-variant:small-caps');
	assert.equal(font.set, false);	
	
	var copy = font.copy();
	assert.equal(copy.getCss(), 'font-family:Arial;font-variant:small-caps');
	assert.equal(copy.set, false);	
	
	assert.ok(font.equals(copy));
	assert.ok(copy.equals(font));	

	// copy .set
	font.set = true;
	assert.equal(font.set, true);	
	assert.equal(copy.set, false, 'true copy, not referenced');	
	var copy = font.copy();
	assert.equal(copy.set, true, 'set also copied');	
});