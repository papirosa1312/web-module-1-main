## Рішення щодо рефакторингу

Монолітний код було розділено за тришаровою архітектурою

### Модулі

Було створено такі модулі: orderStore відповідає за збереження стану в памяті,
 orderService відповідає за бізнес логіку
 orderRoutes відповідає за маршрутизацію

### Очищення коду

Було прибрано:
 1) function slopify було прибрано оскільки вона не виконувала ніяких дій а лише засмічувала вивід консолі;
 2) const LEGACY_REGION бо вона не використовується;
 3) function unusedLegacyOrderCode не використовувалась;
 4) async function synchronizeOrderState створювала фейкову затримку;
 5) function prepareOrderContext, function persistOrderWithContext, function verifyOrderStateForRemoval - функції пустушкі, які не робили нічого корисного;
 6) Наступний код було видалено через повторну перевірку та фейкову затримку:
    	const existingOrder = orders.find((order) => order.id === orderId);
      	if (!existingOrder) {
      	  return res.status(404).json(notFoundProblem()); 
   	}
    await verifyOrderStateForRemoval(existingOrder);
 
 7) Замість функції яка повертала те саме в масив з затримкою
    const storedOrder = await persistOrderWithContext(newOrder);
    const responseBody = orderResponse(storedOrder);

    було замінено на:

    orders.push(newOrder);
    const responseBody = orderResponse(newOrder);

 8) Замість рядків 
    	const context = await prepareOrderContext(matchingOrder);
    	const responseBody = orderResponse(context.record);
    тепер просто прямий виклик:
    	return res.status(200).json(orderResponse(matchingOrder)),
    оскільки prepareOrderContext запускала фейковий таймер та повертала те саме



### API-контракт

Поведінку було перевірено за допомогою npm test, у результаті всі 4 тести виконані успішно

### Швидкодія

До:    середня затримка 1184ms/ p50 1341ms/ p95 1952ms/ p99 2009ms/ пропускна здатність 20.5 req/s 
Після: середня затримка 11ms/ p50 11ms/ p95 19ms/ p99 27ms/ пропускна здатність 2157 req/s

Які ендпоінти були найповільнішими та чому?

Найповільнішими були POST /orders, GET /orders/:id та DELETE /orders/:id оскільки вони викликали ланцюжок функцій які зверталися до функції з штучною затримкою.

### Перевірка AI-змін
Яку зміну, запропоновану AI, ви перевірили? Чи погодилися з нею?

AI пропонував підключити бібліотеку Zod для перевірки даних і переписати все на класи. Я відхилив цю ідею так як для простого проєкту це зайве ускладнення на рівному місці. До того ж сторонні бібліотеки міняють текст помилок, через що посипалися б готові автотести.