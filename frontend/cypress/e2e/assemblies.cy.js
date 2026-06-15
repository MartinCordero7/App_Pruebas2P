describe("Asambleas y Decisiones", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/assemblies");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título de la página", () => {

        cy.contains("Asambleas y Decisiones")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el botón Convocar Asamblea", () => {

        cy.contains("Convocar Asamblea")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra las pestañas Asambleas y Votaciones", () => {

        cy.contains("Asambleas").should("exist");
        cy.contains("Votaciones").should("exist");

    });

    it("[APROBACIÓN] Muestra estadísticas de asambleas", () => {

        cy.contains("Total Asambleas").should("exist");
        cy.contains("Próximas").should("exist");
        cy.contains("Realizadas").should("exist");

    });

    it("[APROBACIÓN] Abre el formulario de convocar asamblea", () => {

        cy.contains("Convocar Asamblea").click();

        cy.get('input[name="title"]').should("exist");

    });

    it("[APROBACIÓN] Crea una asamblea exitosamente", () => {

        cy.contains("Convocar Asamblea").click();

        cy.get('input[name="title"]').type("Asamblea General Ordinaria 2026");
        cy.get('input[name="date"]').type("2026-12-01T10:00");
        cy.get('textarea[name="agenda"]').type("1. Lectura del acta anterior\n2. Aprobación del presupuesto 2026\n3. Varios");
        cy.get('input[name="expected_quorum"]').clear().type("60");

        cy.contains("Convocar").click();

        // El formulario debe cerrarse
        cy.get('input[name="title"]').should("not.exist");

    });

    it("[APROBACIÓN] Navega a la pestaña de Votaciones", () => {

        cy.contains("Votaciones").click();

        cy.contains("Resultados de Votaciones")
            .should("exist");

    });

    it("[APROBACIÓN] Cierra el formulario con Cancelar", () => {

        cy.contains("Convocar Asamblea").click();
        cy.contains("Cancelar").click();

        cy.get('input[name="title"]')
            .should("not.exist");

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/assemblies");

        cy.url()
            .should("include", "/login");

    });

    it("[FALLO] Muestra error de validación si el título tiene menos de 5 caracteres", () => {

        cy.contains("Convocar Asamblea").click();

        cy.get('input[name="title"]').type("Asm"); // 3 chars — menos que el mínimo de 5
        cy.get('input[name="date"]').type("2026-12-01T10:00");
        cy.get('textarea[name="agenda"]').type("Orden del día suficientemente largo");

        cy.contains("Convocar").click();

        // La validación frontend muestra el mensaje de error y el form permanece abierto
        cy.contains("Mínimo 5 caracteres")
            .should("exist");

    });

    it("[FALLO] Muestra error de validación si el orden del día tiene menos de 10 caracteres", () => {

        cy.contains("Convocar Asamblea").click();

        cy.get('input[name="title"]').type("Asamblea General Válida");
        cy.get('input[name="date"]').type("2026-12-01T10:00");
        cy.get('textarea[name="agenda"]').type("Corto"); // 5 chars — menos que el mínimo de 10

        cy.contains("Convocar").click();

        // La validación frontend muestra el mensaje y el form permanece abierto
        cy.contains("Mínimo 10 caracteres")
            .should("exist");

    });

});
