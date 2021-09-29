qs = (e) -> document.querySelectorAll e

tabs = qs '.tab'
tabsArr = [];

Array.from(tabs).forEach (e) ->
	tabsArr.push e.id
	return

hash = window.location.hash

hashUpdate = ->
	hash = window.location.hash
	return

switchTab = (p,n) ->
	p = p.toString().replace /\#/g,''
	n = n.toString().replace /\#/g,''

	if tabsArr.includes n
		qs("\##{n}")[0].style.opacity = '1'

		if qs("\##{n}")[0].dataset.nav
			qs("\#btn-nav-#{n}")[0].classList.add 'selected'

		tabs.forEach (e) ->
			if e.id isnt n
				e.style.opacity = '0'
				if e.dataset.nav
					qs("#btn-nav-#{e.id}")[0].classList.remove 'selected'
			return

		if tabsArr.indexOf(n) > tabsArr.indexOf(p)
			qs("\##{p}")[0].style.transform = 'translate(-100vw,0)'
		else if tabsArr.indexOf(n) < tabsArr.indexOf(p)
			qs("\##{p}")[0].style.transform = 'translate(100vw,0)'

		qs("\##{n}")[0].style.transform = 'translate(0,0)'

		tabs.forEach (e,i) ->
			unless [n,p].includes(e.id)
				if tabsArr.indexOf(e.id) > tabsArr.indexOf(n)
					e.style.transform = 'translate(100vw,0)'
				else if tabsArr.indexOf(e.id) < tabsArr.indexOf(n)
					e.style.transform = 'translate(-100vw,0)'
			return

		hashUpdate()
	return

window.onhashchange = ->
	switchTab hash,window.location.hash
	return

window.location.hash = '#to-dos'
switchTab '#to-dos',window.location.hash

# xhr = new 

# qs('#school-list')[0].