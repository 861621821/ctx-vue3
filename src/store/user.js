import { ref } from 'vue';

export const useUserStore = () => {
    const newTodo = ref(false);
    const setNewTodo = (status) => {
        newTodo.value = status;
    };

    return { newTodo, setNewTodo };
};
