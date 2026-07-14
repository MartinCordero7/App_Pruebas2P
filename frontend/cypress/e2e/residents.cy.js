describe("Residentes", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/residents");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título de la página", () => {

        cy.contains("Residentes")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el botón Nuevo Residente", () => {

        cy.contains("Nuevo Residente")
            .should("exist");

    });

    it("[APROBACIÓN] Abre el formulario al hacer clic en Nuevo Residente", () => {

        cy.contains("Nuevo Residente").click();

        cy.contains("Crear Residente")
            .should("exist");

    });

    it("[APROBACIÓN] Crea un nuevo residente exitosamente", () => {

        const ts = Date.now();

        cy.contains("Nuevo Residente").click();

        cy.get('input[name="nombres"]')
            .type("Juan");

        cy.get('input[name="apellidos"]')
            .type("Pérez");

        cy.get('input[name="correo"]')
            .type(`juan${ts}@test.com`);

        cy.get('input[name="telefono"]')
            .type("0991234567");

        cy.get('input[name="numeroIdentificacion"]')
            .type(`${ts}`.slice(-10));

        cy.get('button[type="submit"]')
            .click();

        cy.contains("Crear Residente")
            .should("not.exist");

    });

    it("[APROBACIÓN] El campo de búsqueda existe", () => {

        cy.get('input[placeholder="Buscar residentes..."]')
            .should("exist");

    });

    it("[APROBACIÓN] Cierra el formulario al hacer clic en Cancelar", () => {

        cy.contains("Nuevo Residente").click();
        cy.contains("Cancelar").click();

        cy.contains("Crear Residente")
            .should("not.exist");

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/residents");

        cy.url()
            .should("include", "/login");

    });

    it("[FALLO] No guarda residente si los campos requeridos están vacíos", () => {

        cy.contains("Nuevo Residente").click();

        // Intentar guardar sin llenar campos obligatorios
        cy.contains("Guardar").click();

        // El formulario debe seguir visible (no se cerró)
        cy.contains("Crear Residente")
            .should("exist");

    });

});
