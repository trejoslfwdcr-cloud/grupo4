/* SISTEMA DE GESTIÓN DE BECAS - CÓDIGO JAVASCRIPT */

/* Función anónima autoejecutable que envuelve todo el código para evitar contaminación del scope global */
(function(){
	/* ----- HELPERS PARA ALMACENAMIENTO LOCAL ----- */
	/* Objeto LS proporciona métodos para guardar y obtener datos del localStorage del navegador */
	const LS = {
		/* Método para obtener datos del localStorage */
		/* k = clave, intenta parsear como JSON, devuelve null si no existe o hay error */
		get(k){
			try{
				return JSON.parse(localStorage.getItem(k)||'null')
			}catch(e){
				return null
			}
		},
		/* Método para guardar datos en localStorage como JSON */
		/* k = clave, v = valor a guardar */
		set(k,v){
			localStorage.setItem(k,JSON.stringify(v))
		}
	}

	/* ----- CONSTANTES DE CLAVES PARA ALMACENAMIENTO ----- */
	/* Define las claves usadas para almacenar diferentes tipos de datos en localStorage */
	const KEYS={
		USERS:'becasUsers',              /* Clave para guardar la lista de usuarios */
		CONVS:'becasConvocatorias',      /* Clave para guardar las convocatorias */
		APPS:'becasApplications',        /* Clave para guardar las postulaciones */
		SESSION:'becasSession'           /* Clave para guardar el usuario actual logueado */
	}

	/* ----- FUNCIÓN PARA INICIALIZAR DATOS DE PRUEBA ----- */
	/* Llena el localStorage con usuarios y datos iniciales si están vacíos */
	function seed(){
		/* Verifica si ya existen usuarios en localStorage */
		if(!LS.get(KEYS.USERS)){
			/* Crea array con 3 usuarios de prueba: admin, evaluador y postulante */
			const Usuarios=[
				/* Usuario administrador con credenciales de prueba */
				{id:id(),name:'Administrador',email:'admin@gmail.com',password:'admin',role:'admin',age:35},
				/* Usuario evaluador con credenciales de prueba */
				{id:id(),name:'Evaluador',email:'evalue@dominio',password:'evalue',role:'evaluador',age:30},
				/* Usuario postulante con credenciales de prueba */
				{id:id(),name:'Postulante',email:'user@dominio',password:'user',role:'postulante',age:22}
			]; 
			/* Guarda los usuarios en localStorage */
			LS.set(KEYS.USERS,Usuarios)
		}
		/* Si no hay convocatorias, crea un array vacío */
		if(!LS.get(KEYS.CONVS)) LS.set(KEYS.CONVS,[])
		/* Si no hay postulaciones, crea un array vacío */
		if(!LS.get(KEYS.APPS)) LS.set(KEYS.APPS,[])
	}

	/* ----- FUNCIÓN PARA GENERAR ID's ÚNICOS ----- */
	/* Genera un ID único basado en timestamp y números aleatorios */
	function id(){
		return Date.now().toString(36)+Math.random().toString(36).slice(2,8)
	}

	/* ----- SELECTORES DE ELEMENTOS DEL DOM ----- */
	/* Función auxiliar para obtener elementos del DOM por selector */
	const el = sel => document.querySelector(sel)

	/* ----- ELEMENTOS PRINCIPALES DEL DOM ----- */
	/* Paneles/secciones */
	const authSection = el('authSection'),  /* Sección de login y registro */
	      dashboard = el('dashboard'),        /* Panel principal después de loguear */
	      navUser = el('navUser')            /* Barra de navegación del usuario */
	const welcome = el('welcome')             /* Elemento para mensaje de bienvenida */
	
	/* Paneles específicos por rol */
	const adminPanel = el('adminPanel'),           /* Panel para administradores */
	      postulantePanel = el('postulantePanel'), /* Panel para postulantes */
	      evaluadorPanel = el('evaluadorPanel'),   /* Panel para evaluadores */
	      reportsPanel = el('reportsPanel')        /* Panel de reportes y estadísticas */
z
	/* ----- ELEMENTOS DE FORMULARIOS ----- */
	const loginForm = el('login-form'),       /* Formulario de inicio de sesión */
	      registerForm = el('register-form'), /* Formulario de registro */
	      convForm = el('conv-form')          /* Formulario para crear convocatorias */

	/* ----- LISTAS QUE SE RELLENAN DINÁMICAMENTE ----- */
	const convoList = el('conv-list'),           /* Lista de convocatorias (para admin) */
	      openConvos = el('open-convos'),         /* Lista de convocatorias abiertas */
	      myApps = el('my-apps'),               /* Lista de mis postulaciones */
	      appsToEvaluate = el('apps-to-evaluate'), /* Lista de postulaciones a evaluar */
	      reports = el('reports')               /* Contenedor para reportes */

	/* ----- PLANTILLAS HTML PARA CLONAR ----- */
	const convTpl = el('conv-item-tpl'),   /* Plantilla para items de convocatorias */
	      appTpl = el('app-item-tpl')      /* Plantilla para items de postulaciones */

	/* Modal para diálogos emergentes */
	const modal = el('modal')

	/* ----- INICIALIZACIÓN DE LA APLICACIÓN ----- */
	/* Carga o crea los datos iniciales */
	seed()

	/* ----- FUNCIONES DE SESIÓN Y ESTADO ----- */
	/* Obtiene el usuario actualmente logueado */
	function currentUser(){
		return LS.get(KEYS.SESSION)
	}

	/* Guarda la sesión del usuario (lo logea) */
	function saveSession(user){
		LS.set(KEYS.SESSION,user)
	}

	/* Borra la sesión del usuario (lo deslogea) */
	function clearSession(){
		localStorage.removeItem(KEYS.SESSION)
	}

	/* ----- FUNCIONES DE NAVEGACIÓN Y RENDERIZADO ----- */
	/* Renderiza la barra de navegación superior */
	function renderNav(){
		/* Obtiene el usuario actual */
		const user = currentUser()
		/* Si no hay usuario logueado, muestra botón de login */
		if(!user){
			navUser.innerHTML=`<button id="btn-show-auth">Iniciar / Registrar</button>`;
			el('#btn-show-auth').onclick=()=>{showPanel('auth')};
			return
		}
		/* Si hay usuario, muestra saludo y botón de logout */
		navUser.innerHTML=`<span>Hola, ${user.name} (${user.role})</span> <button id="btn-logout">Cerrar sesión</button>`
		el('#btn-logout').onclick=()=>{clearSession();renderApp()}
	}

	/* Muestra u oculta los paneles principales */
	function showPanel(which){
		/* Si se pide el panel de auth, lo muestra y oculta el dashboard */
		if(which==='auth'){
			authSection.classList.remove('hidden');
			dashboard.classList.add('hidden');
			return
		}
		/* Si se pide otro panel, oculta auth y muestra dashboard */
		authSection.classList.add('hidden');
		dashboard.classList.remove('hidden')
	}

	/* Función principal que renderiza toda la aplicación */
	function renderApp(){
		/* Actualiza la navegación */
		renderNav()
		/* Obtiene el usuario actual */
		const user = currentUser()
		/* Si no hay usuario, muestra formularios de auth */
		if(!user){
			showPanel('auth');
			return
		}
		/* Si hay usuario, muestra el dashboard */
		showPanel('dashboard')
		/* Muestra mensaje personalizado de bienvenida */
		welcome.textContent = `Bienvenido/a, ${user.name}`
		
		/* Muestra/oculta paneles según el rol del usuario */
		/* Alterna clase 'hidden' dependiendo si el rol coincide */
		adminPanel.classList.toggle('hidden', user.role!=='admin')
		postulantePanel.classList.toggle('hidden', user.role!=='postulante')
		evaluadorPanel.classList.toggle('hidden', user.role!=='evaluador')
		reportsPanel.classList.toggle('hidden', user.role!=='admin')

		/* Renderiza todos los paneles de contenido */
		renderConvList()      /* Lista de convocatorias (admin) */
		renderOpenConvs()     /* Convocatorias abiertas para postular */
		renderMyApps()        /* Mis postulaciones */
		renderAppsToEvaluate() /* Postulaciones a evaluar */
		renderReports()       /* Reportes y estadísticas */
	}

	/* ----- FUNCIONES PARA CONVOCATORIAS (ADMIN) ----- */
	/* Evento: cuando el admin envía el formulario de nueva convocatoria */
	convForm.addEventListener('submit',e=>{
		/* Previene el comportamiento por defecto de envío de formulario */
		e.preventDefault()
		/* Obtiene la lista actual de convocatorias */
		const convs = LS.get(KEYS.CONVS) || []
		/* Obtiene y valida el nombre de la beca */
		const name = el('#conv-name').value.trim(); 
		if(!name) return alert('Ingrese nombre')
		/* Crea objeto con los datos de la nueva convocatoria */
		const conv = {
			id:id(),  /* ID único */
			name,     /* Nombre de la beca */
			type:el('#conv-type').value.trim(),  /* Tipo: económica/academica/social */
			start:el('#conv-start').value,       /* Fecha de inicio */
			end:el('#conv-end').value,           /* Fecha de cierre */
			/* Procesa requisitos: divide por comas, limpia espacios y filtra vacíos */
			requirements:(el('#conv-requirements').value||'').split(',').map(s=>s.trim()).filter(Boolean),
			desc:el('#conv-desc').value,  /* Descripción */
			state:'abierta'               /* Estado inicial: abierta */
		}
		/* Agrega la nueva convocatoria a la lista */
		convs.push(conv);
		/* Guarda en localStorage */
		LS.set(KEYS.CONVS,convs)
		/* Limpia el formulario */
		convForm.reset();
		/* Actualiza los paneles afectados */
		renderConvList();
		renderOpenConvs();
		alert('Convocatoria creada')
	})

	/* Renderiza la lista de convocatorias para el admin */
	function renderConvList(){
		/* Obtiene la lista de convocatorias */
		const convs = LS.get(KEYS.CONVS)||[];
		/* Limpia el contenedor */
		convList.innerHTML=''
		/* Recorre cada convocatoria */
		convs.forEach(c=>{
			/* Clona el template HTML para este item */
			const li = convTpl.content.firstElementChild.cloneNode(true)
			/* Rellena el nombre */
			li.querySelector('.conv-name').textContent = c.name + ` `
			/* Rellena metadatos: tipo, fechas y estado */
			li.querySelector('.meta').textContent = `${c.type} • ${c.start} → ${c.end} • ${c.state}`
			/* Rellena la descripción */
			li.querySelector('.conv-desc').textContent = c.desc
			/* Obtiene el contenedor de acciones */
			const actions = li.querySelector('.conv-actions')
			
			/* Crea botón para abrir/cerrar la convocatoria */
			const btnToggle = document.createElement('button');
			btnToggle.textContent = c.state==='abierta'?'Cerrar':'Abrir'
			btnToggle.onclick = ()=>{
				/* Cambia el estado entre abierta y cerrada */
				c.state = c.state==='abierta'?'cerrada':'abierta';
				/* Guarda cambios */
				LS.set(KEYS.CONVS,convs);
				/* Actualiza vistas */
				renderConvList();
				renderOpenConvs()
			}
			
			/* Crea botón para eliminar la convocatoria */
			const btnDelete = document.createElement('button');
			btnDelete.textContent='Eliminar'
			btnDelete.onclick = ()=>{
				if(confirm('Eliminar convocatoria?')){
					/* Filtra la convocatoria de la lista */
					LS.set(KEYS.CONVS,convs.filter(x=>x.id!==c.id));
					/* Actualiza vistas */
					renderConvList();
					renderOpenConvs()
				}
			}
			/* Agrega botones al contenedor de acciones */
			actions.appendChild(btnToggle);
			actions.appendChild(btnDelete)
			/* Agrega el item a la lista */
			convList.appendChild(li)
		})
	}

	/* ----- FUNCIONES PARA POSTULANTES: VER Y POSTULAR A CONVOCATORIAS ----- */
	/* Obtiene la fecha actual en formato YYYY-MM-DD */
	function nowDate(){
		const d=new Date();
		return d.toISOString().slice(0,10)
	}

	/* Renderiza las convocatorias abiertas y vigentes para que postulantes se inscriban */
	function renderOpenConvs(){
		/* Obtiene lista de convocatorias */
		const convs = LS.get(KEYS.CONVS)||[];
		/* Limpia el contenedor */
		openConvs.innerHTML=''
		/* Obtiene la fecha actual */
		const today = nowDate()
		/* Filtra: convocatorias abiertas, con fecha de inicio pasada y fecha de cierre futura */
		convs.filter(c=>c.state==='abierta' && c.start<=today && c.end>=today).forEach(c=>{
			/* Clona el template */
			const li = convTpl.content.firstElementChild.cloneNode(true)
			/* Rellena nombre */
			li.querySelector('.conv-name').textContent = c.name
			/* Rellena metadatos */
			li.querySelector('.meta').textContent = `${c.type} • ${c.start} → ${c.end}`
			/* Rellena descripción */
			li.querySelector('.conv-desc').textContent = c.desc
			/* Crea botón para postular */
			const btnApply = document.createElement('button');
			btnApply.textContent='Postular'
			btnApply.onclick = ()=>{openApplyModal(c)}
			/* Agrega botón de postular */
			li.querySelector('.conv-actions').appendChild(btnApply)
			/* Agrega item a la lista */
			openConvs.appendChild(li)
		})
	}

	/* Abre un modal para que el postulante complete el formulario de postulación */
	function openApplyModal(conv){
		/* Obtiene el usuario actual */
		const user = currentUser();
		if(!user) return alert('Inicia sesión')
		/* Obtiene la lista de postulaciones */
		const apps = LS.get(KEYS.APPS)||[]
		/* Verifica si el usuario ya ha postulado a esta convocatoria */
		if(apps.find(a=>a.convId===conv.id && a.userId===user.id)) 
			return alert('Ya postulaste a esta convocatoria')
		
		/* Muestra modal con formulario de postulación */
		showModal(`<div class="box">
			<h3>Postulación: ${conv.name}</h3>
			<form id="apply-form">
				<!-- Campo nombre prerrelleno con datos del usuario -->
				<input id="ap-nombre" placeholder="Nombre" value="${user.name}" required />
				<!-- Campo email prerrelleno -->
				<input id="ap-email" placeholder="Email" value="${user.email}" required />
				<!-- Campo edad prerrelleno -->
				<input id="ap-age" type="number" placeholder="Edad" value="${user.age||''}" required />
				<!-- Campo para nivel educativo -->
				<input id="ap-education" placeholder="Nivel educativo" required />
				<!-- Campo para ingreso mensual -->
				<input id="ap-income" type="number" placeholder="Ingreso mensual" required />
				<!-- Campo para explicar motivo de solicitud -->
				<textarea id="ap-reason" placeholder="Motivo" required></textarea>
				<!-- Botones para enviar o cancelar -->
				<div style="display:flex;gap:8px;margin-top:8px"><button type="submit">Enviar</button><button id="cancel">Cancelar</button></div>
			</form>
		</div>`)
		
		/* Evento para botón Cancelar */
		el('#cancel').onclick = ()=>hideModal()
		
		/* Evento para envío del formulario */
		el('#apply-form').onsubmit = e=>{
			e.preventDefault()
			/* Recopila datos del formulario */
			const data = {
				name:el('#ap-nombre').value.trim(),
				email:el('#ap-email').value.trim(),
				age:parseInt(el('#ap-age').value,10),
				education:el('#ap-education').value.trim(),
				income:parseFloat(el('#ap-income').value||0),
				reason:el('#ap-reason').value.trim()
			}
			/* Validación: verifica que no haya campos vacíos */
			if(!data.name||!data.email||!data.education||!data.reason){
				return alert('Complete todos los campos')
			}
			
			/* REGLAS DE VALIDACIÓN AUTOMÁTICA (ejemplo) */
			/* Si edad >= 18 y ingreso <= 2000: se considera apta */
			let validation = 'Pendiente de revisión'
			if(data.age>=18 && data.income<=2000) 
				validation='Apta'
			else if(data.age<18 || data.income>8000) 
				validation='No apta'

			/* Crea objeto de postulación */
			const app = {
				id:id(),                          /* ID único */
				convId:conv.id,                  /* ID de la convocatoria */
				userId:currentUser().id,          /* ID del usuario postulante */
				created:nowDate(),                /* Fecha de creación */
				data,                             /* Datos del formulario */
				validation,                       /* Validación automática */
				state:'Enviada',                 /* Estado inicial */
				evaluations:[],                  /* Array para evaluaciones de evaluadores */
				scoreTotal:0                     /* Puntuación total */
			}
			
			/* Agrega la postulación a la lista */
			const apps = LS.get(KEYS.APPS)||[];
			apps.push(app);
			LS.set(KEYS.APPS,apps)
			
			/* Cierra modal y actualiza vistas */
			hideModal();
			renderMyApps();
			renderAppsToEvaluate();
			alert('Postulación enviada. Resultado preliminar: '+validation)
		}
	}

	/* ----- MIS POSTULACIONES (POSTULANTE) ----- */
	/* Renderiza el listado de postulaciones del usuario actual */
	function renderMyApps(){
		/* Obtiene usuario actual */
		const user = currentUser();
		/* Limpia el contenedor */
		myApps.innerHTML=''
		/* Si no hay usuario, no renderiza nada */
		if(!user) return
		
		/* Obtiene todas las postulaciones del usuario actual */
		const apps = (LS.get(KEYS.APPS)||[]).filter(a=>a.userId===user.id)
		
		/* Recorre cada postulación */
		apps.forEach(a=>{
			/* Clona el template */
			const li = appTpl.content.firstElementChild.cloneNode(true)
			/* Busca la convocatoria asociada */
			const conv = (LS.get(KEYS.CONVS)||[]).find(c=>c.id===a.convId)
			/* Rellena título con nombre de la convocatoria */
			li.querySelector('.app-title').textContent = conv?conv.name:'(convocatoria eliminada)'
			/* Rellena metadatos: fecha de envío y validación automática */
			li.querySelector('.app-meta').textContent = `Enviado: ${a.created} • Validación: ${a.validation}`
			
			/* Rellena estado */
			const stateEl = li.querySelector('.app-state');
			stateEl.textContent = `Estado: ${a.state}`
			/* Aplica colores según estado */
			if(a.state==='Aprobada') stateEl.classList.add('state-Aprobada')
			if(a.state==='Rechazada') stateEl.classList.add('state-Rechazada')
			if(a.state==='En revisión') stateEl.classList.add('state-En revisión')
			
			/* Obtiene contenedor de acciones */
			const actions = li.querySelector('.app-actions')
			
			/* Crea botón para ver detalles */
			const btnView = document.createElement('button');
			btnView.textContent='Ver'
			btnView.onclick = ()=>{
				/* Muestra objeto JSON con todos los detalles */
				alert(JSON.stringify(a,null,2))
			}
			actions.appendChild(btnView)
			myApps.appendChild(li)
		})
	}

	/* ----- EVALUADOR: EVALUAR POSTULACIONES ----- */
	/* Renderiza las postulaciones pendientes de evaluación */
	function renderAppsToEvaluate(){
		/* Obtiene usuario actual */
		const user = currentUser();
		/* Limpia contenedor */
		appsToEvaluate.innerHTML=''
		/* Si no hay usuario, no renderiza nada */
		if(!user) return
		
		/* Obtiene postulaciones en estados "Enviada" o "En revisión" */
		const apps = (LS.get(KEYS.APPS)||[]).filter(a=>a.state==='Enviada' || a.state==='En revisión')
		
		/* Recorre cada postulación */
		apps.forEach(a=>{
			/* Clona el template */
			const li = appTpl.content.firstElementChild.cloneNode(true)
			/* Busca convocatoria asociada */
			const conv = (LS.get(KEYS.CONVS)||[]).find(c=>c.id===a.convId)
			/* Rellena título */
			li.querySelector('.app-title').textContent = conv?conv.name:'(convocatoria eliminada)'
			/* Rellena metadatos con nombre del postulante y fecha */
			li.querySelector('.app-meta').textContent = `Postulante: ${a.data.name} • Enviado: ${a.created}`
			/* Rellena estado */
			li.querySelector('.app-state').textContent = `Estado: ${a.state}`
			
			/* Crea botón para evaluar */
			const btnEval = document.createElement('button');
			btnEval.textContent='Evaluar'
			btnEval.onclick = ()=>openEvaluationModal(a)
			/* Agrega botón */
			li.querySelector('.app-actions').appendChild(btnEval)
			appsToEvaluate.appendChild(li)
		})
	}

	/* Abre un modal para que el evaluador califique la postulación */
	function openEvaluationModal(app){
		/* Muestra modal con formulario de evaluación */
		showModal(`<div class="box"><h3>Evaluar solicitud</h3>
			<form id="eval-form">
				<!-- Campo para situación económica (0-40 puntos) -->
				<label>Situación económica (0-40)<input id="s-econ" type="number" min="0" max="40" required /></label>
				<!-- Campo para rendimiento académico (0-30 puntos) -->
				<label>Rendimiento académico (0-30)<input id="s-acad" type="number" min="0" max="30" required /></label>
				<!-- Campo para contexto social (0-30 puntos) -->
				<label>Contexto social (0-30)<input id="s-soc" type="number" min="0" max="30" required /></label>
				<!-- Campo para observaciones -->
				<textarea id="s-obs" placeholder="Observaciones"></textarea>
				<!-- Selector para recomendación final -->
				<label>Recomendación: <select id="s-rec"><option value="Aprobada">Aprobar</option><option value="Rechazada">Rechazar</option></select></label>
				<!-- Botones para guardar o cancelar -->
				<div style="display:flex;gap:8px;margin-top:8px"><button type="submit">Guardar evaluación</button><button id="cancel-eval">Cancelar</button></div>
			</form></div>`)
		
		/* Evento para botón Cancelar */
		el('#cancel-eval').onclick = ()=>hideModal()
		
		/* Inicializa campos con valores por defecto 0 */
		el('#s-econ').value = 0;
		el('#s-acad').value=0;
		el('#s-soc').value=0
		
		/* Evento para envío del formulario de evaluación */
		el('#eval-form').onsubmit = e=>{
			e.preventDefault()
			/* Obtiene las puntuaciones */
			const s1 = parseFloat(el('#s-econ').value||0),      /* Situación económica */
			      s2=parseFloat(el('#s-acad').value||0),        /* Rendimiento académico */
			      s3=parseFloat(el('#s-soc').value||0)         /* Contexto social */
			/* Suma total de puntos */
			const total = s1+s2+s3
			/* Obtiene observaciones y recomendación */
			const obs = el('#s-obs').value.trim();
			const rec = el('#s-rec').value
			
			/* Obtiene la postulación a evaluar */
			const apps = LS.get(KEYS.APPS)||[];
			const target = apps.find(x=>x.id===app.id)
			if(!target) return alert('Solicitud no encontrada')
			
			/* Agrega la evaluación al array de evaluaciones */
			target.evaluations.push({
				evaluador:currentUser().id,              /* ID del evaluador */
				date:nowDate(),                         /* Fecha de evaluación */
				scores:{econ:s1,acad:s2,soc:s3},      /* Puntuaciones */
				total,                                  /* Total */
				obs,                                    /* Observaciones */
				recommendation:rec                      /* Recomendación */
			})
			/* Actualiza puntuación total */
			target.scoreTotal = total
			/* Actualiza estado según la recomendación */
			target.state = rec
			/* Guarda cambios */
			LS.set(KEYS.APPS,apps)
			
			/* Cierra modal y actualiza vistas */
			hideModal();
			renderAppsToEvaluate();
			renderMyApps();
			renderReports();
			alert('Evaluación guardada')
		}
	}

	/* ----- REPORTES Y ESTADÍSTICAS (ADMIN) ----- */
	/* Renderiza estadísticas de postulaciones */
	function renderReports(){
		/* Obtiene convocatorias y postulaciones */
		const convs = LS.get(KEYS.CONVS)||[];
		const apps = LS.get(KEYS.APPS)||[]
		/* Limpia contenedor */
		reports.innerHTML = ''
		
		/* Agrupa postulaciones por estado */
		const byState = apps.reduce((acc,a)=>{
			acc[a.state]=(acc[a.state]||0)+1;
			return acc
		},{})
		/* Calcula total de postulaciones */
		const total = apps.length
		
		/* Crea elemento para mostrar total */
		const el1 = document.createElement('div');
		el1.innerHTML = `<p>Total postulaciones: <strong>${total}</strong></p>`
		
		/* Crea elemento para mostrar desglose por estado con badges */
		const el2 = document.createElement('div');
		el2.innerHTML = `<p>Por estado: ${Object.entries(byState).map(([k,v])=>`<span class="badge">${k}: ${v}</span>`).join(' ')}</p>`
		
		/* Agrega elementos al contenedor de reportes */
		reports.appendChild(el1);
		reports.appendChild(el2)
	}

	/* ----- FUNCIONES AUXILIARES DE MODAL ----- */
	/* Muestra un modal con contenido HTML */
	function showModal(html){
		modal.innerHTML = html;
		modal.classList.remove('hidden')
	}
	
	/* Oculta el modal */
	function hideModal(){
		modal.innerHTML='';
		modal.classList.add('hidden')
	}

	/* ----- MANEJADORES DE AUTENTICACIÓN ----- */
	/* Evento: cuando usuario envía formulario de registro */
	registerForm.addEventListener('submit',e=>{
		e.preventDefault()
		/* Obtiene lista de usuarios */
		const users = LS.get(KEYS.USERS)||[]
		/* Obtiene datos del formulario */
		const name = el('#reg-name').value.trim(),
		      email = el('#reg-email').value.trim(),
		      password = el('#reg-password').value,
		      age = parseInt(el('#reg-age').value||0,10),
		      role = el('#reg-role').value
		/* Verifica que el email no esté registrado */
		if(users.find(u=>u.email===email)) 
			return alert('Email ya registrado')
		/* Crea nuevo usuario */
		const u = {id:id(),name,email,password,role,age}
		/* Agrega usuario a lista */
		users.push(u);
		LS.set(KEYS.USERS,users);
		/* Logea al nuevo usuario */
		saveSession(u);
		/* Actualiza interfaz */
		renderApp()
	})

	/* Evento: cuando usuario envía formulario de login */
	loginForm.addEventListener('submit',e=>{
		e.preventDefault()
		/* Obtiene lista de usuarios */
		const users = LS.get(KEYS.USERS)||[]
		/* Obtiene datos del formulario */
		const email = el('#login-email').value.trim(),
		      password = el('#login-password').value,
		      role = el('#login-role').value
		/* Busca usuario con credenciales coincidentes */
		const u = users.find(x=>x.email===email && x.password===password && x.role===role)
		/* Si no encuentra, muestra error */
		if(!u) return alert('Credenciales inválidas')
		/* Logea al usuario */
		saveSession(u);
		/* Actualiza interfaz */
		renderApp()
	})

	/* ----- INICIALIZACIÓN FINAL ----- */
	/* Renderiza la aplicación cuando se carga la página */
	renderApp()

	/* ----- OBJETO GLOBAL PARA DEPURACIÓN ----- */
	/* Expone algunos objetos globales para debugging en consola */
	window._becas = {LS,KEYS}

/* Cierra la función autoejecutable */
})();

