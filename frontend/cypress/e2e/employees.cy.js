describe("Gestión de Personal (Empleados)", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/employees");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título de la página", () => {

        cy.contains("Gestión de Personal")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el botón Contratar Empleado", () => {

        cy.contains("Contratar Empleado")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra las pestañas Empleados, Nómina y Turnos", () => {

        cy.contains("Empleados").should("exist");
        cy.contains("Nómina").should("exist");
        cy.contains("Turnos").should("exist");

    });

    it("[APROBACIÓN] Muestra las estadísticas de empleados", () => {

        cy.contains("Empleados Activos").should("exist");
        cy.contains("Total de Empleados").should("exist");
        cy.contains("Nómina Mensual").should("exist");

    });

    it("[APROBACIÓN] Abre el formulario al hacer clic en Contratar Empleado", () => {

        cy.contains("Contratar Empleado").click();

        cy.contains("Contratar Empleado")
            .should("exist");

        cy.get('input[name="first_name"]').should("exist");

    });

    it("[APROBACIÓN] Contrata un empleado exitosamente", () => {

        cy.contains("Contratar Empleado").click();

        cy.get('input[name="first_name"]').type("Carlos");
        cy.get('input[name="last_name"]').type("López");
        cy.get('input[name="email"]').type(`carlos.lopez.${Date.now()}@test.com`);
        cy.get('select[name="position"]').select("guardia");
        cy.get('input[name="salary"]').type("800");
        cy.get('input[name="hire_date"]').type("2026-01-15");

        cy.contains("Guardar").click();

        cy.get('input[name="first_name"]')
            .should("not.exist");

    });

    it("[APROBACIÓN] Navega a la pestaña Nómina", () => {

        cy.contains("Nómina").click();

        cy.contains("Nómina Mensual")
            .should("exist");

    });

    it("[APROBACIÓN] Navega a la pestaña Turnos", () => {

        cy.contains("Turnos").click();

        cy.contains("Asignación de Turnos")
            .should("exist");

    });

    it("[APROBACIÓN] Cierra el formulario con Cancelar", () => {

        cy.contains("Contratar Empleado").click();
        cy.contains("Cancelar").click();

        cy.get('input[name="first_name"]')
            .should("not.exist");

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/employees");

        cy.url()
            .should("include", "/login");

    });

    it("[FALLO] Muestra error de validación si el nombre tiene menos de 2 caracteres", () => {

        cy.contains("Contratar Empleado").click();

        cy.get('input[name="first_name"]').type("A"); // 1 char — mínimo requerido: 2
        cy.get('input[name="last_name"]').type("López");
        cy.get('input[name="salary"]').type("800");
        cy.get('input[name="hire_date"]').type("2026-01-15");

        cy.contains("Guardar").click();

        // La validación frontend bloquea el envío y muestra el mensaje de error
        cy.contains("Mínimo 2 caracteres")
            .should("exist");

    });

    it("[FALLO] Muestra error de validación si faltan campos obligatorios (salario y fecha)", () => {

        cy.contains("Contratar Empleado").click();

        cy.get('input[name="first_name"]').type("Pedro");
        cy.get('input[name="last_name"]').type("Ramírez");
        // Sin salario ni fecha de contratación

        cy.contains("Guardar").click();

        // Debe aparecer el mensaje de campo requerido
        cy.contains("es requerido")
            .should("exist");

    });

});
