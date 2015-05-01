CSSJSON = require 'cssjson'

game = document.getElementsByClassName('game')[0]

markup = game.getElementsByClassName('html')[0]

style = game.getElementsByClassName('css')[0]

code = 
	html: markup
	css: style


parser = 
	parseHTML : (html, code) ->
		lower = code
		for i in [0...html.length]
			child = lower.getElementsByClassName(html[i])[0]
			console.log child
			if child then lower = child 

			else 
				console.log 'KEEP THE RULES(markup error)!!!!'
				return off
		console.log 'HTML has been successfully parsed'
	parseCSS : (css, code) ->
		json = CSSJSON.toJSON(code.innerHTML)
		objects = json.children

		for element of css 
			for property of css[element]
				rule = css[element][property]

				real = objects[element].attributes[property]

				if rule is real
					console.log "#{property} of #{element} is right"
				else
					console.log "#{property} of #{element} is NOT right"



parser.parseHTML(rules.html, code.html)
parser.parseCSS(rules.css, code.css)