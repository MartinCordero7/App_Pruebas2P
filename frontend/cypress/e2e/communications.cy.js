describe("Comunicación Interna", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/communications");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título de la página", () => {

        cy.contains("Comunicación Interna")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el botón Nuevo Comunicado", () => {

        cy.contains("Nuevo Comunicado")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra las tres pestañas (Comunicados, Visitantes, Seguridad)", () => {

        cy.contains("Comunicados").should("exist");
        cy.contains("Visitantes").should("exist");
        cy.contains("Seguridad").should("exist");

    });

    it("[APROBACIÓN] Abre el formulario de nuevo comunicado", () => {

        cy.contains("Nuevo Comunicado").click();

        cy.get('input[name="title"]').should("exist");

    });

    it("[APROBACIÓN] Crea un comunicado en borrador exitosamente", () => {

        cy.contains("Nuevo Comunicado").click();

        cy.get('input[name="title"]').type("Aviso importante para todos los residentes");
        cy.get('textarea[name="message"]').type("Este es un mensaje de prueba con contenido suficientemente largo para pasar la validación.");
        cy.get('select[name="type"]').select("general");
        cy.get('select[name="status"]').select("borrador");

        cy.contains("Guardar").click();

        cy.get('input[name="title"]')
            .should("not.exist");

    });

    it("[APROBACIÓN] Navega a la pestaña de Visitantes", () => {

        cy.contains("Visitantes").click();

        cy.contains("Registro de Visitantes")
            .should("exist");

    });

    it("[APROBACIÓN] Navega a la pestaña de Seguridad", () => {

        cy.contains("Seguridad").click();

        cy.contains("Bitácora de Seguridad")
            .should("exist");

    });

    it("[APROBACIÓN] Cierra el formulario con Cancelar", () => {

        cy.contains("Nuevo Comunicado").click();
        cy.contains("Cancelar").click();

        cy.get('input[name="title"]')
            .should("not.exist");

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/communications");

        cy.url()
            .should("include", "/login");

    });

    it("[FALLO] Muestra error de validación si el título tiene menos de 5 caracteres", () => {

        cy.contains("Nuevo Comunicado").click();

        cy.get('input[name="title"]').type("Hola"); // 4 chars — mínimo requerido: 5
        cy.get('textarea[name="message"]').type("Mensaje suficientemente largo para pasar la validación de longitud mínima.");

        cy.contains("Guardar").click();

        // La validación frontend bloquea el envío y muestra el mensaje de error
        cy.contains("Mínimo 5 caracteres")
            .should("exist");

    });

    it("[FALLO] Muestra error de validación si el mensaje tiene menos de 10 caracteres", () => {

        cy.contains("Nuevo Comunicado").click();

        cy.get('input[name="title"]').type("Título válido para el comunicado");
        cy.get('textarea[name="message"]').type("Corto"); // 5 chars — mínimo requerido: 10

        cy.contains("Guardar").click();

        cy.contains("Mínimo 10 caracteres")
            .should("exist");

    });

});
