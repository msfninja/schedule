qs = (e) -> document.querySelectorAll e

setHdr = (c) ->
	qs('header').forEach (e) ->
		if c
			e.style.transform = 'translate(0,-100%)'
		else
			e.style.transform = 'translate(0,0)'
		return
	return

qs('span').forEach (e) ->
	if e.dataset.ins is 'currentYear'
		e.innerHTML = (new Date).getFullYear()
	return

qs('a').forEach (e) ->
	e.title = e.href
	return

document.body.onscroll = ->
	if window.scrollY > 100
		setHdr off
	else
		setHdr on
	return

document.body.onload = ->
	qs('#cnt')[0].style.opacity = '1'
	qs('#loader')[0].style.opacity = '0'
	qs('#loader')[0].style.transform = 'scale(1.25)'
	setTimeout (->
		qs('#loader')[0].style.display = 'none'
		return
	),250
	return