export interface DefaultComponentProps {
    id?: string;
    class?: string;
    style?: string;
}

export const DefaultComponentProps = {
    id: String,
    class: { type: String, default: '' },
    style: String,
};
