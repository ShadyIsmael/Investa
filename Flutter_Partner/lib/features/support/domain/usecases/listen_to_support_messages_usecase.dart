import '../entities/support_message.dart';
import '../repositories/support_repository.dart';

class ListenToSupportMessagesUseCase {
  final SupportRepository repository;

  ListenToSupportMessagesUseCase(this.repository);

  Stream<SupportMessage> call() {
    return repository.listenToSupportMessages();
  }
}
