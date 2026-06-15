describe("Gestión de Documentos", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/documents");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título de la página", () => {

        cy.contains("Gestión de Documentos")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el botón Nuevo Documento", () => {

        cy.contains("Nuevo Documento")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra la sección de Documentos Archivados", () => {

        cy.contains("Documentos Archivados")
            .should("exist");

    });

    it("[APROBACIÓN] Abre el formulario al hacer clic en Nuevo Documento", () => {

        cy.contains("Nuevo Documento").click();

        cy.contains("Nuevo Documento")
            .should("exist");

        cy.get('input[name="title"]').should("exist");

    });

    it("[APROBACIÓN] El formulario muestra los campos correctos", () => {

        cy.contains("Nuevo Documento").click();

        cy.get('input[name="title"]').should("exist");
        cy.get('select[name="documentType"]').should("exist");
        cy.get('select[name="relatedEntityType"]').should("exist");

    });

    it("[APROBACIÓN] Crea un documento exitosamente", () => {

        cy.contains("Nuevo Documento").click();

        cy.get('input[name="title"]').type("Reglamento del Edificio");
        cy.get('select[name="documentType"]').select("reglamento");
        cy.get('select[name="relatedEntityType"]').select("building");

        cy.contains("Guardar").click();

        cy.get('input[name="title"]')
            .should("not.exist");

    });

    it("[APROBACIÓN] Cierra el formulario con Cancelar", () => {

        cy.contains("Nuevo Documento").click();
        cy.contains("Cancelar").click();

        cy.get('input[name="title"]')
            .should("not.exist");

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/documents");

        cy.url()
            .should("include", "/login");

    });

    it("[FALLO] No guarda documento si el título está vacío", () => {

        cy.contains("Nuevo Documento").click();

        // Sin completar el título obligatorio
        cy.contains("Guardar").click();

        // El formulario sigue visible
        cy.get('input[name="title"]')
            .should("exist");

    });

});
