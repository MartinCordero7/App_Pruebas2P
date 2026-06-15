describe("Mantenimiento e Incidencias", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/maintenance");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título de la página", () => {

        cy.contains("Mantenimiento e Incidencias")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el botón Nuevo Ticket", () => {

        cy.contains("Nuevo Ticket")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra las estadísticas de tickets (Abiertos, En Progreso, Total)", () => {

        cy.contains("Abiertos").should("exist");
        cy.contains("En Progreso").should("exist");
        cy.contains("Total Tickets").should("exist");

    });

    it("[APROBACIÓN] Muestra los filtros de estado", () => {

        cy.contains("Todos").should("exist");
        cy.contains("abierto").should("exist");
        cy.contains("en progreso").should("exist");
        cy.contains("completado").should("exist");

    });

    it("[APROBACIÓN] Abre el formulario de nueva solicitud", () => {

        cy.contains("Nuevo Ticket").click();

        cy.contains("Nueva Solicitud de Mantenimiento")
            .should("exist");

    });

    it("[APROBACIÓN] Crea un ticket de mantenimiento exitosamente", () => {

        cy.contains("Nuevo Ticket").click();

        cy.get('input[name="title"]').type("Reparar grieta en pared del pasillo");
        cy.get('textarea[name="description"]').type("Existe una grieta visible en la pared del pasillo principal que requiere atención inmediata.");
        cy.get('select[name="type"]').select("reparacion");
        cy.get('select[name="priority"]').select("normal");

        cy.contains("Crear").click();

        cy.contains("Nueva Solicitud de Mantenimiento")
            .should("not.exist");

    });

    it("[APROBACIÓN] Filtra tickets por estado 'abierto'", () => {

        cy.contains("abierto").click();

        cy.url().should("include", "/maintenance");

    });

    it("[APROBACIÓN] Cierra el formulario con Cancelar", () => {

        cy.contains("Nuevo Ticket").click();
        cy.contains("Cancelar").click();

        cy.contains("Nueva Solicitud de Mantenimiento")
            .should("not.exist");

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/maintenance");

        cy.url()
            .should("include", "/login");

    });

    it("[FALLO] Muestra error de validación si el título tiene menos de 5 caracteres", () => {

        cy.contains("Nuevo Ticket").click();

        cy.get('input[name="title"]').type("ABC"); // 3 chars — mínimo requerido: 5
        cy.get('textarea[name="description"]').type("Descripción suficientemente larga para pasar la validación de longitud.");

        cy.contains("Crear").click();

        // El mensaje de error de validación aparece y el formulario permanece abierto
        cy.contains("Mínimo 5 caracteres")
            .should("exist");

    });

    it("[FALLO] Muestra error de validación si la descripción tiene menos de 10 caracteres", () => {

        cy.contains("Nuevo Ticket").click();

        cy.get('input[name="title"]').type("Título válido para la prueba");
        cy.get('textarea[name="description"]').type("Corta"); // 5 chars — mínimo requerido: 10

        cy.contains("Crear").click();

        cy.contains("Mínimo 10 caracteres")
            .should("exist");

    });

});
