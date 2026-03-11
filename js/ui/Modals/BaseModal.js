/**
 * Класс BaseModal
 * Используется как базовый класс всплывающего окна
 */
class BaseModal {
  constructor(element) {
    // Сохраняем jQuery-элемент для работы с Semantic UI
    this.semanticElement = element;
    // Сохраняем чистый DOM-элемент (он на нулевой позиции в коллекции jQuery)
    this.element = element[0];
  }

  /**
   * Открывает всплывающее окно
   */
  open() {
    this.semanticElement.modal('show');
  }

  /**
   * Закрывает всплывающее окно
   */
  close() {
    this.semanticElement.modal('hide');
  }
}