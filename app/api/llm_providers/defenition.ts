

export interface Base {
    id: string;
    timestamp?: Date;
}


export interface Answer {
    query: string;
    query_role?: string;
    thinking?: string | null;
    answer?: string | null;
    model_role?: string | null;
    other_dict?: Array<Record<string, string>> | null;
}


export interface RagAnswer extends Answer {
    context: Array<string>;
}
