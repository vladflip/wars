CSSJSON = require 'cssjson'

classes = 
	g : 'game'
	h : 'html'
	c: 'css'

rules = 
	html: ['nice', 'button', 'menu']
	css: 
		'.menu' : 
			'margin' : 'auto'
			'width' : '100px'
		'.button' :
			'background-color' : '#cfcfcf'
		'.nice' :
			'height' : '50px'





game = document.getElementsByClassName(classes.g)[0]

markup = game.getElementsByClassName(classes.h)[0]

style = game.getElementsByClassName(classes.c)[0]

code = 
	html: markup
	css: style


parser =
	fdcl: (code, cls) -> 
		#find elements by classname
		return code.getElementsByClassName(cls)

	fdPr: (elm, cls) ->
		#find parent by class. until some of parent elements will not
		#have such class do search (looks like el.parent().parent().parent())
		#and so on but if any parents still exists
		(if elm.parentElement isnt null then elm = elm.parentElement else return off) until elm.classList.contains cls
		return elm


	error: (aspect, obj) ->
		#switch for the reason of checking
		switch aspect
			when 'html' 

				#if parent element exists
				if obj.parent.el 

					#all is fine
					console.log "#{obj.child.class} element has his #{obj.parent.class} parent"
				else 

					#all is not fine
					console.log "#{obj.child.class} element has NOT his #{obj.parent.class} parent"
			when 'css'

				#if value of property in the RULES is the same as in the CODE
				if obj.rule is obj.real

					#all is fine
					console.log "#{obj.names.property} of #{obj.names.element} is right"
				else 

					#all is not fine
					console.log "#{obj.names.property} of #{obj.names.element} is NOT right"
	parseHTML : (html, code) ->
		#for loop for every CLASSNAME in HTML classes array
		for i in [0..html.length]

			#element's class
			elcl = html[i]

			#get elements by class
			elements = parser.fdcl(code, elcl)

			#for loop for single element of getted elements array
			for element in elements

				#if next number exists in the HTML classes array
				if i+1 < html.length

					#parent's class === prcl
					prcl = html[i+1]

					#find parent by class
					parent = parser.fdPr(element, prcl)

					#checking for errors
					parser.error( 
						'html', 
						{
							child:
								el: element
								class: elcl
							parent: 
								el: parent
								class: prcl
						})

			


	parseCSS : (css, code) ->
		json = CSSJSON.toJSON(code.innerHTML)
		objects = json.children

		#for loop for rules of single element (RULES obj)
		for element of css 
			#for loop for single property of single element (RULES obj)
			for property of css[element]
				#rule is single property of single element (RULES obj)
				rule = css[element][property]

				#real is single property of single element (custom code)
				real = objects[element].attributes[property]

				#checking for errors
				parser.error(
					'css', 
					{
						rule: rule
						real: real
						names: 
							property: property
							element: element
					})



parser.parseHTML(rules.html, code.html)
parser.parseCSS(rules.css, code.css)