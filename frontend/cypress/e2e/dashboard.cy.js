describe("Dashboard", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/dashboard");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título del Dashboard", () => {

        cy.contains("Dashboard")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra la tarjeta de Total Residentes", () => {

        cy.contains("Total Residentes")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra la tarjeta de Total Unidades", () => {

        cy.contains("Total Unidades")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra la tarjeta de Cartera Vencida", () => {

        cy.contains("Cartera Vencida")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra la tarjeta de Ingresos Totales", () => {

        cy.contains("Ingresos Totales")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el gráfico de Ingresos vs Egresos", () => {

        cy.contains("Ingresos vs Egresos")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el gráfico de Tendencia Mensual", () => {

        cy.contains("Tendencia Mensual")
            .should("exist");

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/dashboard");

        cy.url()
            .should("include", "/login");

    });

});
