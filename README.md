# arNote
* Сервис хранения желаний, планирования трат.
* Сервис аналитики инвестиций в рынки ценных бумаг.

# Сам сервис
http://84.201.163.22:8080/

# Сам сервис локально
http://localhost:4200/

# Запуск на локале
- npm install
- ng build
- ng serve

# Остановка

- ps -ef | grep "ng serve"
- kill -9 <PID>


# Сборка для Прода
- ng build --prod
- после чего подлить в папку static папки resource проекта arNote, собрать его и запустить или выкатить на Prod.

# Что сделали:
* Теперь есть проверка даты - если добавляешь инструмент и на дату добавления не было торгов.


#Ближайшие срочные мелкие косяки и баги:

* Группы
* Нужно будет переработать http-сервис и унифицировать его - убрать такое кол-во запросов POST, к примеру. Можно ли их все заменить на один унифицированный?
* Не видно стрелку в первом столбце таблицы фин-планов для фин-планнинга для мобильной версии - сменить цвет
* Все же научиться цветом (фиолетовым) при досрочном погашении научиться не все строку выделять, а только кредит, который погасили
* Убрать столбец Траты для мобильной версии фин-планов
* Известный уже баг - при попадании на fin-planning - 403-я ошибка.
* При выходе не обновляется сайдбар и не появляются нужные пункты меню
* Я зашел по ссылке xxx.xx.xx.xx.xx/somelink, токен протух, и при переходе на линк вижу 500-ю. Что делать?
* При добавлении желания указывается неверная дата (предыдущий день почему-то)
* Заблочить добавление желаний пока не добавлена зарплата
* Сразу после удаления желаний - надо все обновлять
* Блочить все кнопки у желаний пока не добавлена зарплата
* Пока не добавлено хотя бы одно желания - блочить кнопки поиска, сортировки и прочее
* Пока не добавлено желания больше 2 - блочить фильтры и все остальное
* Ставить по дефолту настройку пользовательского просмотра
* Надо чистить код на фронте конечно - как минимум создать енумы какие-то для значений
* Подлить коллекцию Постмана в репозиторий, добавить туда энвайронменты
* Надо убрать РеспонсЭнтити и возвращать нормальные ДТО-объекты, а не этот пиздец
* Сделать чтобы в помесячной группировке показывалось сколько денег переносится на следующий месяц
* Сделать какой-то учет текущей суммы
* Вынести вкладку помесячной группировки на сайдбар
* Добавить вкладку групп (так же вынести в сайдбар)
* Прокинуть интерцепторы
* Общий ЭксепшнХендлер
* Отображать какой сейчас фильтр и сортировка включены
* Сделать само-отключение поиска
* Нормальный DNS для сайта
* Показывать более развернутую статистику: реализованное и все такое
* При щелчке на желании показывать в каком оно месяце при помесячном отображении
* Надо организовать еще списки подсчетов с исключением определенных записей.
* Надо чтобы нельзя было добавлять одинаковые желания
* Написать статью на AntonRomanov.com о сервисе
* Починить фигню с тем что надо щелкнуть чтобы табличка подгрузилась
* Починить фигню с 401-й странице
* Подсмотреть как сделан шедулинг проверки протухания токена с выводом алерта.
* Фавикон
* Выделение и перемещение по месяцам нескольких желаний
* Кнопочки Реализовать / Удалить / Редактировать при нажатии на желание в помесячно-групповом режиме
* Надо юзеру postgres разрешить доступ только с локальной машины
* Кнопочки "Вернуться в табличный режим" и "Обновить" заменить для мобилы
* Избавиться от $Do и всего такого.


#Что надо сделать еще:

* Надо что-то делать с датой, если она пуста при реализации желания
* Убрать ненужные кнопки не с админской странички. И выключать кнопки когда не нужно (в т.ч. в диалоговых окнах)
* В фильтрацию добавить < / > какой-то суммы, и так же добавить фильтрацию по дате
* Привести в порядок форму парсинга csv
* Ролевые модели
* Нормальный поиск (эвент при нажатии каждой клавиши)
* Надо подумать как сделать тему, какие юзеры ща онлайн.
* Надо подумать на хера мне вообще MainService. Что он делает?
* Прикрутить фотки юзеров и отображение / обрезку в круге (а также желаний)
* Отдельные особенности интерфейса для админа
* Подумать над реализацией калькулятора строительства, то есть отображения как в Гугл-Таблицах
* Надо сделать чтобы можно было сметы сохранять (типа хранение таких как бы табличек, с разными ячейками, кодом ячейки, на который можно ссылаться, ну и так далее...)
* Учет зп/аванса
* Возможность просматривать реализованные желания и проводить какие-то операции с ними
* Сделать обрезку wish-name в датагриде на фронте по длине и еще и наложить ограничения при добавлении по длине
* Надо бы обработать на беке тему с протуханием токенов (примеры я видел)
* Сделать чтобы уже при вводе логина при редактировании пользователя осуществлялся запрос при каждом нажатии и поиск - есть такой юзер или нет
* Подумать что делать если куки запрещены. Может в сессии еще хранить
* Надо запретить юзеру вообще делать какие-либо действия если у него крипто-мод, а крипто-кей не задан или не подгружен.
* Домик и сайдбар почистили, но теперь "оно" вообще никогда не отображается.
* Проблема протухания токена и проблема отображения старого меню юзера для протухшего токена
* Надо все правки желаний утащить в один метод
* В перспективе надо сделать такой дашбоард с виджетом статистики. Типа добавлено в этом месяце, реализовано, удалено, изменено, добавлено на сумму и так далее....
* Почистить код на фронте. Там пиздец просто....

#Отдаленные планы:

* Переехать на последнюю версию Ангуляра
* Ссылки
* Аналог эверноута
* Система планирования путешествий
* Мобильное приложение
* Публичные списки
* Блог
* Разные списки





 

