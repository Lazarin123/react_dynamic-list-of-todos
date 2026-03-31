import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { Todo } from '../types/Todo';
import { User } from '../types/User';
import { FilterType } from '../types/FilterType';
import { getTodos, getUser } from '../api';

type TodoContextType = {
  loadTodos: () => void;
  todos: Todo[];
  selectedFilter: FilterType;
  setSelectedFilter: (filter: FilterType) => void;
  visibleTodos: Todo[];
  modalOpen: boolean;
  searchTitle: string;
  setSearchTitle: (title: string) => void;
  user: User | null;
  userTodo: Todo | null;
  isLoading: boolean;
  hasError: boolean;
  userError: boolean;
  isUserLoading: boolean;
  handleOpenUserModal: (todo: Todo) => void;
  handleCloseUserModal: () => void;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const todoContext = React.createContext<TodoContextType>({
  loadTodos: () => {},
  todos: [],
  selectedFilter: 'all',
  setSelectedFilter: () => {},
  visibleTodos: [],
  modalOpen: false,
  searchTitle: '',
  setSearchTitle: () => {},
  user: null,
  userTodo: null,
  hasError: false,
  isLoading: true,
  userError: false,
  isUserLoading: false,
  handleOpenUserModal: () => {},
  handleCloseUserModal: () => {},
  handleSearchChange: () => {},
});

export const TodoContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [userTodo, setUserTodo] = useState<Todo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [userError, setUserError] = useState(false);

  const loadTodos = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    getTodos()
      .then(setTodos)
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleOpenUserModal = (todo: Todo) => {
    setModalOpen(true);
    setIsUserLoading(true);
    setUserTodo(todo);
    setUserError(false);

    getUser(todo.userId)
      .then(setUser)
      .catch(() => setUserError(true))
      .finally(() => setIsUserLoading(false));
  };

  const handleCloseUserModal = () => {
    setModalOpen(false);
    setUser(null);
    setUserTodo(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(event.target.value);
  };

  const visibleTodos = useMemo(() => {
    const normalizedSearch = searchTitle.toLowerCase().trim();

    return todos.filter(todo => {
      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'active' && !todo.completed) ||
        (selectedFilter === 'completed' && todo.completed);

      const matchesSearch = todo.title.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [todos, selectedFilter, searchTitle]);

  const contextValue = {
    loadTodos,
    todos,
    selectedFilter,
    setSelectedFilter,
    visibleTodos,
    modalOpen,
    searchTitle,
    setSearchTitle,
    user,
    userTodo,
    isLoading,
    hasError,
    isUserLoading,
    userError,
    handleOpenUserModal,
    handleCloseUserModal,
    handleSearchChange,
  };

  return (
    <todoContext.Provider value={contextValue}>
      {children}
    </todoContext.Provider>
  );
};
