document.addEventListener("DOMContentLoaded", function() {
    const content = {
        tab1: "",
        tab2: "",
        tab3: "",
        tab4: ""
    };

    const editor = document.getElementById('code-editor');
    
    function updateEditorPlaceholder() {
        const activeTab = document.querySelector('.tab.active').dataset.tab;
        editor.placeholder = content[activeTab] || "Consola de Entrada, escribe aquí...";
    }

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const activeTab = this.dataset.tab;
            editor.value = content[activeTab];
            updateEditorPlaceholder(); // Actualiza el placeholder
        });
    });

    editor.addEventListener('input', function() {
        const activeTab = document.querySelector('.tab.active').dataset.tab;
        content[activeTab] = this.value;
    });

    document.getElementById('openFile').addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.oak';
        input.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const activeTab = document.querySelector('.tab.active').dataset.tab;
                    content[activeTab] = ev.target.result;
                    editor.value = ev.target.result;
                    updateEditorPlaceholder(); // Actualiza el placeholder después de cargar el archivo
                }
                reader.readAsText(file);
            }
        };
        input.click();
    });

    document.getElementById('reportFile').addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                const fileURL = URL.createObjectURL(file);
                window.open(fileURL);
            }
        };
        input.click();
    });

    // Establece el placeholder inicial en caso de que ya haya una pestaña activa al cargar la página
    updateEditorPlaceholder();
});
