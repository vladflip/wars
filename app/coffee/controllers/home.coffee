module.exports = (req, res, next) ->
	a = 
		fuck : 'fuckee'

	res.send "#{a.fuck}"
