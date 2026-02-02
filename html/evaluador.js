/* SCRIPT PARA EVALUADORES - Panel de Evaluación de Solicitudes
   - Muestra postulaciones pendientes de evaluar
   - Permite al evaluador asignar puntuaciones y recomendaciones
   - Persiste evaluaciones en localStorage con clave 'becas_applications'
   - Cada línea contiene comentario explicativo del propósito
*/

/* Función autoejecutable que encapsula toda la lógica del módulo */
(function(){

    /* ===== HELPERS PARA ALMACENAMIENTO LOCAL ===== */

    /* Objeto que proporciona métodos para guardar/obtener datos JSON en localStorage */
    const LS = {
        /* Obtiene un valor de localStorage y lo parsea como JSON; retorna null si falla */
        get(k){
            try{
                return JSON.parse(localStorage.getItem(k) || 'null')
            }catch(e){
                return null
            }
        },
        /* Serializa un objeto a JSON y lo guarda en localStorage */
        set(k, v){
            localStorage.setItem(k, JSON.stringify(v))
        }
    }

    /* ===== CONSTANTES DE CLAVES DE ALMACENAMIENTO ===== */

    /* Define las claves reutilizadas por todo el proyecto para consistencia */
    const KEYS = {
        USERS: 'becas_users',              /* Clave donde se guardan los usuarios */
        CONVS: 'becas_convocatorias',      /* Clave donde se guardan las convocatorias */
        APPS: 'becas_applications',        /* Clave donde se guardan las postulaciones/aplicaciones */
        SESSION: 'becas_session'           /* Clave donde se guarda la sesión actual */
    }

    /* ===== GENERADOR DE IDS ÚNICOS ===== */

    /* Genera un ID único combinando timestamp y números aleatorios */
    function id(){
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    }

    /* ===== HELPER PARA SELECCIONAR ELEMENTOS DEL DOM ===== */

    /* Función corta para document.querySelector */
    const el = sel => document.querySelector(sel)

    /* ===== REFERENCIAS A ELEMENTOS DEL DOM ===== */

    /* Encabezado donde se muestra información del usuario evaluador */
    const header = document.querySelector('header')
    /* Barra de navegación del usuario (se rellena dinámicamente) */
    const navUser = el('#nav-user')
    /* Contenedor principal de la aplicación */
    const app = el('#app')
    /* Sección que contiene la lista de postulaciones */
    const toEvaluateSection = el('#to-evaluate')
    /* Lista donde aparecerán los ítems de evaluación */
    const appsToEvaluate = el('#apps-to-evaluate')
    /* Template que se clonará para crear ítems de postulación */
    const appTpl = el('#app-item-tpl')
    /* Modal para mostrar formulario de evaluación */
    const modal = el('#modal')

    /* ===== INICIALIZACIÓN: VERIFICAR QUE EXISTE EL MODAL ===== */

    /* Si no existe el modal, crear uno dinámicamente para evitar errores */
    if(!modal){
        const newModal = document.createElement('div')
        newModal.id = 'modal'
        newModal.className = 'hidden'
        document.body.appendChild(newModal)
    }

    /* ===== FUNCIONES DE SESIÓN ===== */

    /* Obtiene el usuario actualmente logueado de localStorage */
    function currentUser(){
        return LS.get(KEYS.SESSION)
    }

    /* Guarda la sesión del usuario en localStorage */
    function saveSession(user){
        LS.set(KEYS.SESSION, user)
    }

    /* Elimina la sesión del usuario (cierra sesión) */
    function clearSession(){
        localStorage.removeItem(KEYS.SESSION)
    }

    /* ===== FUNCIONES AUXILIARES ===== */

    /* Obtiene la fecha actual en formato YYYY-MM-DD */
    function nowDate(){
        const d = new Date()
        return d.toISOString().slice(0, 10)
    }

    /* ===== FUNCIONES DE NAVEGACIÓN ===== */

    /* Renderiza la barra de navegación superior con información del usuario */
    function renderNav(){
        /* Obtiene el usuario en sesión */
        const user = currentUser()

        /* Si no hay usuario, muestra botón para iniciar sesión */
        if(!user){
            navUser.innerHTML = `<button id="btn-login">Iniciar Sesión</button>`
            el('#btn-login').onclick = () => {
                /* En una app real, redirigir a página de login o mostrar modal */
                alert('Por favor, inicie sesión primero')
            }
            return
        }

        /* Si hay usuario, muestra saludo y botón de logout */
        navUser.innerHTML = `<span>Evaluador: ${user.name} (${user.role})</span> <button id="btn-logout">Cerrar Sesión</button>`
        el('#btn-logout').onclick = () => {
            clearSession()
            renderApp()
        }
    }

    /* ===== RENDERIZADO PRINCIPAL ===== */

    /* Función principal que renderiza toda la página y sus contenidos */
    function renderApp(){
        /* Actualiza la navegación superior */
        renderNav()

        /* Obtiene el usuario actual */
        const user = currentUser()

        /* Si no hay usuario, muestra mensaje y oculta el contenido */
        if(!user){
            if(toEvaluateSection) toEvaluateSection.innerHTML = '<p>Debe iniciar sesión como evaluador para acceder a este panel.</p>'
            return
        }

        /* Verifica que el usuario tenga rol de evaluador */
        if(user.role !== 'evaluador'){
            if(toEvaluateSection) toEvaluateSection.innerHTML = '<p>Acceso denegado. Solo los evaluadores pueden acceder a este panel.</p>'
            return
        }

        /* Si tiene acceso correcto, renderiza las postulaciones */
        renderAppsToEvaluate()
    }

    /* ===== RENDERIZADO DE POSTULACIONES A EVALUAR ===== */

    /* Renderiza la lista de postulaciones que requieren evaluación */
    function renderAppsToEvaluate(){
        /* Obtiene todas las postulaciones del almacenamiento */
        const apps = LS.get(KEYS.APPS) || []

        /* Obtiene todas las convocatorias para poder mostrar nombres */
        const convs = LS.get(KEYS.CONVS) || []

        /* Limpia el contenedor de la lista */
        appsToEvaluate.innerHTML = ''

        /* Filtra las postulaciones que están en estado 'Enviada' o 'En revisión' */
        const pendingApps = apps.filter(a => a.state === 'Enviada' || a.state === 'En revisión')

        /* Si no hay postulaciones pendientes, muestra mensaje */
        if(pendingApps.length === 0){
            appsToEvaluate.innerHTML = '<li style="padding: 20px; text-align: center;"><p>No hay solicitudes pendientes de evaluación.</p></li>'
            return
        }

        /* Recorre cada postulación pendiente */
        pendingApps.forEach(app => {
            /* Clona el template HTML para este ítem */
            const li = appTpl.content.firstElementChild.cloneNode(true)

            /* Busca la convocatoria asociada a esta postulación */
            const conv = convs.find(c => c.id === app.convId)

            /* Rellena el título con la información de la postulación */
            li.querySelector('.app-title').textContent = conv ? conv.name : '(Sin convocatoria)'

            /* Rellena los metadatos: nombre del postulante, email, fecha */
            const metaText = `Postulante: ${app.data.nombre || 'N/A'} • Enviado: ${app.created}`
            li.querySelector('.app-meta').textContent = metaText

            /* Rellena el estado actual de la postulación */
            const stateEl = li.querySelector('.app-state')
            stateEl.textContent = `Estado: ${app.state}`
            /* Aplica clase CSS según el estado (si existe en index.css) */
            if(app.state === 'Aprobada') stateEl.classList.add('state-aprobada')
            if(app.state === 'Rechazada') stateEl.classList.add('state-rechazada')
            if(app.state === 'En revisión') stateEl.classList.add('state-en-revision')

            /* Obtiene el contenedor de acciones (botones) */
            const actions = li.querySelector('.app-actions')

            /* Crea botón para abrir modal de evaluación */
            const btnEvaluate = document.createElement('button')
            btnEvaluate.textContent = 'Evaluar'
            btnEvaluate.onclick = () => openEvaluationModal(app)
            actions.appendChild(btnEvaluate)

            /* Crea botón para ver detalles completos de la solicitud */
            const btnView = document.createElement('button')
            btnView.textContent = 'Ver Detalles'
            btnView.onclick = () => {
                alert('Detalles de la solicitud:\n\n' + JSON.stringify(app, null, 2))
            }
            actions.appendChild(btnView)

            /* Agrega el item a la lista */
            appsToEvaluate.appendChild(li)
        })
    }

    /* ===== MODAL DE EVALUACIÓN ===== */

    /* Abre un modal con el formulario de evaluación para una postulación */
    function openEvaluationModal(app){
        /* Verifica que haya usuario logueado */
        const user = currentUser()
        if(!user || user.role !== 'evaluador'){
            alert('Debe ser evaluador para acceder a esto')
            return
        }

        /* HTML del modal con formulario de evaluación */
        const modalHTML = `
            <div class="box" style="background: white; padding: 20px; border-radius: 8px; max-width: 600px;">
                <h3>Evaluar Solicitud</h3>
                <p><strong>Postulante:</strong> ${app.data.nombre || 'N/A'}</p>
                <form id="eval-form">
                    <!-- Campo para puntuación de situación económica (0-40 puntos) -->
                    <label for="s-econ">Situación económica (0-40)</label>
                    <input id="s-econ" type="number" min="0" max="40" value="0" required>

                    <!-- Campo para puntuación de rendimiento académico (0-30 puntos) -->
                    <label for="s-acad">Rendimiento académico (0-30)</label>
                    <input id="s-acad" type="number" min="0" max="30" value="0" required>

                    <!-- Campo para puntuación de contexto social (0-30 puntos) -->
                    <label for="s-soc">Contexto social (0-30)</label>
                    <input id="s-soc" type="number" min="0" max="30" value="0" required>

                    <!-- Área de texto para observaciones del evaluador -->
                    <label for="s-obs">Observaciones</label>
                    <textarea id="s-obs" placeholder="Escriba sus observaciones aquí..." style="min-height: 100px;"></textarea>

                    <!-- Selector para la recomendación final del evaluador -->
                    <label for="s-rec">Recomendación</label>
                    <select id="s-rec">
                        <option value="Aprobada">Aprobar</option>
                        <option value="Rechazada">Rechazar</option>
                        <option value="En revisión">En revisión</option>
                    </select>

                    <!-- Botones para guardar o cancelar -->
                    <div style="display: flex; gap: 8px; margin-top: 15px;">
                        <button type="submit" style="flex: 1; padding: 10px; background: #2b6cb0; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar Evaluación</button>
                        <button type="button" id="cancel-eval" style="flex: 1; padding: 10px; background: #999; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        `

        /* Muestra el modal con el formulario */
        showModal(modalHTML)

        /* Obtiene el formulario dentro del modal */
        const form = el('#eval-form')
        /* Obtiene el botón de cancelar */
        const btnCancel = el('#cancel-eval')

        /* Evento para cancelar: oculta el modal */
        btnCancel.onclick = () => hideModal()

        /* Evento para envío del formulario */
        form.onsubmit = e => {
            e.preventDefault()

            /* Obtiene las puntuaciones ingresadas */
            const econ = parseFloat(el('#s-econ').value || 0)
            const acad = parseFloat(el('#s-acad').value || 0)
            const soc = parseFloat(el('#s-soc').value || 0)
            /* Calcula el total de puntos */
            const total = econ + acad + soc
            /* Obtiene las observaciones */
            const obs = el('#s-obs').value.trim()
            /* Obtiene la recomendación seleccionada */
            const rec = el('#s-rec').value

            /* Obtiene todas las postulaciones del almacenamiento */
            const apps = LS.get(KEYS.APPS) || []
            /* Busca la postulación que se está evaluando */
            const target = apps.find(x => x.id === app.id)
            /* Verifica que la postulación exista */
            if(!target){
                alert('Error: No se encontró la solicitud')
                return
            }

            /* Crea objeto con la evaluación */
            const evaluation = {
                evaluador: user.id,           /* ID del evaluador */
                date: nowDate(),              /* Fecha de evaluación */
                scores: {
                    econ: econ,               /* Puntuación económica */
                    acad: acad,               /* Puntuación académica */
                    soc: soc                  /* Puntuación social */
                },
                total: total,                 /* Total de puntos */
                obs: obs,                     /* Observaciones */
                recommendation: rec           /* Recomendación */
            }

            /* Agrega la evaluación al array de evaluaciones */
            target.evaluations.push(evaluation)
            /* Actualiza la puntuación total de la postulación */
            target.scoreTotal = total
            /* Actualiza el estado según la recomendación */
            target.state = rec

            /* Guarda los cambios en localStorage */
            LS.set(KEYS.APPS, apps)

            /* Oculta el modal */
            hideModal()
            /* Actualiza el renderizado de postulaciones */
            renderAppsToEvaluate()
            /* Confirma al usuario que se guardó */
            alert('Evaluación guardada correctamente. Puntuación total: ' + total)
        }
    }

    /* ===== FUNCIONES PARA MANEJAR EL MODAL ===== */

    /* Muestra el modal con contenido HTML */
    function showModal(html){
        modal.innerHTML = html
        modal.classList.remove('hidden')
        /* Agrega estilos dinámicos para centrar el modal */
        modal.style.position = 'fixed'
        modal.style.inset = '0'
        modal.style.background = 'rgba(0,0,0,0.4)'
        modal.style.display = 'flex'
        modal.style.alignItems = 'center'
        modal.style.justifyContent = 'center'
        modal.style.zIndex = '1000'
    }

    /* Oculta el modal */
    function hideModal(){
        modal.innerHTML = ''
        modal.classList.add('hidden')
        modal.style.display = 'none'
    }

    /* ===== INICIALIZACIÓN ===== */

    /* Renderiza la aplicación cuando se carga el script */
    renderApp()

    /* Expone un objeto global para depuración (opcional) */
    window._evaluador = { LS, KEYS, renderApp, currentUser }

/* Cierra la función autoejecutable */
});
