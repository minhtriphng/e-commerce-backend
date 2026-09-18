// Gửi 10 request CÙNG MỘT LÚC
async function main() {
  const requests = Array.from({ length: 10 }).map(() =>
    fetch('http://localhost:8080/orders/test-race', { method: 'GET' }),
  );

  await Promise.all(requests);
  console.log('Đã gửi xong 10 request song song!');
}

main().catch(console.error);
