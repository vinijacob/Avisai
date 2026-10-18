import enum


class Area(enum.StrEnum):
    technology = "technology"
    health = "health"
    business = "business"
    engineering = "engineering"
    humanities = "humanities"


AREA_LABELS: dict[Area, str] = {
    Area.technology: "Tecnologia",
    Area.health: "Saúde",
    Area.business: "Negócios",
    Area.engineering: "Engenharias",
    Area.humanities: "Humanas",
}

COURSES: dict[str, Area] = {
    "Ciência da Computação": Area.technology,
    "Engenharia de Software": Area.technology,
    "Sistemas de Informação": Area.technology,
    "Análise e Desenvolvimento de Sistemas": Area.technology,
    "Ciência de Dados": Area.technology,
    "Medicina": Area.health,
    "Enfermagem": Area.health,
    "Psicologia": Area.health,
    "Nutrição": Area.health,
    "Fisioterapia": Area.health,
    "Administração": Area.business,
    "Ciências Contábeis": Area.business,
    "Economia": Area.business,
    "Marketing": Area.business,
    "Engenharia Civil": Area.engineering,
    "Engenharia Mecânica": Area.engineering,
    "Engenharia Elétrica": Area.engineering,
    "Engenharia de Produção": Area.engineering,
    "Direito": Area.humanities,
    "Pedagogia": Area.humanities,
    "Jornalismo": Area.humanities,
    "Arquitetura e Urbanismo": Area.humanities,
    "Design": Area.humanities,
}
