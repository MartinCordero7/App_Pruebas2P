describe("Unidades", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/units");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título de la página", () => {

        cy.contains("Gestión de Unidades")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el botón Nueva Unidad", () => {

        cy.contains("Nueva Unidad")
            .should("exist");

    });

    it("[APROBACIÓN] Abre el formulario al hacer clic en Nueva Unidad", () => {

        cy.contains("Nueva Unidad").click();

        cy.contains("Crear Unidad")
            .should("exist");

    });

    it("[APROBACIÓN] El formulario muestra los campos requeridos", () => {

        cy.contains("Nueva Unidad").click();

        cy.get('input[name="numero"]').should("exist");
        cy.get('select[name="tipo"]').should("exist");
        cy.get('input[name="alicuota"]').should("exist");

    });

    it("[APROBACIÓN] Crea una nueva unidad exitosamente", () => {

        const ts = Date.now();

        cy.contains("Nueva Unidad").click();

        cy.get('input[name="numero"]').type(`U-${ts}`.slice(-8));
        cy.get('select[name="tipo"]').select("DEPARTAMENTO");
        cy.get('input[name="piso"]').type("1");
        cy.get('input[name="alicuota"]').type("0.0500");
        cy.get('select[name="estadoId"]').select("2");

        cy.get('button[type="submit"]').click();

        cy.contains("Crear Unidad")
            .should("not.exist");

    });

    it("[APROBACIÓN] Cierra el formulario con el botón Cancelar", () => {

        cy.contains("Nueva Unidad").click();
        cy.contains("Cancelar").click();

        cy.contains("Crear Unidad")
            .should("not.exist");

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/units");

        cy.url()
            .should("include", "/login");

    });

    it("[FALLO] No guarda unidad si los campos requeridos están vacíos", () => {

        cy.contains("Nueva Unidad").click();

        // Sin completar campos obligatorios
        cy.contains("Guardar").click();

        // El formulario sigue visible
        cy.contains("Crear Unidad")
            .should("exist");

    });

});
