describe("Cobranza (Billing)", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/billing");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título de la página", () => {

        cy.contains("Gestión de Cobranza")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el botón Nueva Cuota", () => {

        cy.contains("Nueva Cuota")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra las pestañas Facturación y Morosos", () => {

        cy.contains("Facturación").should("exist");
        cy.contains("Morosos").should("exist");

    });

    it("[APROBACIÓN] Abre el formulario al hacer clic en Nueva Cuota", () => {

        cy.contains("Nueva Cuota").click();

        cy.contains("Crear Cuota")
            .should("exist");

    });

    it("[APROBACIÓN] Cambia a la pestaña Morosos correctamente", () => {

        cy.contains("Morosos").click();

        cy.contains("Residentes Morosos")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra la sección de Facturas Pendientes por defecto", () => {

        cy.contains("Facturas Pendientes")
            .should("exist");

    });

    it("[APROBACIÓN] Cierra el formulario con Cancelar", () => {

        cy.contains("Nueva Cuota").click();
        cy.contains("Cancelar").click();

        cy.contains("Crear Cuota")
            .should("not.exist");

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/billing");

        cy.url()
            .should("include", "/login");

    });

    it("[FALLO] No guarda cuota si el monto está vacío", () => {

        cy.contains("Nueva Cuota").click();

        // Intentar guardar sin monto
        cy.contains("Guardar").click();

        // Formulario sigue visible
        cy.contains("Crear Cuota")
            .should("exist");

    });

});
