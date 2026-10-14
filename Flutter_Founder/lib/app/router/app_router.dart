import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fopx_core/fopx_core.dart';

import '../../features/auth/presentation/login_page.dart';
import '../../features/chat/presentation/chat_page.dart';
import '../../features/chat/data/chat_models.dart';
import '../../features/deals/presentation/deals_page.dart';
import '../../features/deals/presentation/contract_detail_page.dart';
import '../../features/deals/presentation/founder_deal_detail_page.dart';
import '../../features/deals/data/founder_deals.dart';
import '../../features/home/presentation/home_page.dart';
import '../../features/notifications/presentation/notifications_page.dart';
import '../../features/profile/presentation/profile_page.dart';
import '../../features/projects/presentation/projects_page.dart';
import '../../features/projects/presentation/project_overview_page.dart';
import '../../features/projects/presentation/project_opportunity_pages.dart';
import '../../features/projects/presentation/project_room_page.dart';
import '../../features/projects/presentation/project_form_page.dart';
import '../../features/projects/presentation/opportunity_requests_page.dart';
import '../../features/projects/presentation/opportunity_form_page.dart';
import '../shell/founder_shell.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    initialLocation: '/home',
    redirect: (context, state) {
      final session = ref.read(sessionControllerProvider);
      if (session.isLoading) return null;
      final authenticated = session.valueOrNull?.isAuthenticated ?? false;
      final isLogin = state.matchedLocation == '/login';
      if (!authenticated && !isLogin) return '/login';
      if (authenticated && isLogin) return '/home';
      return null;
    },
    routes: <RouteBase>[
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      StatefulShellRoute.indexedStack(
        builder:
            (context, state, navigationShell) =>
                FounderShell(navigationShell: navigationShell),
        branches: <StatefulShellBranch>[
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomePage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/projects',
                builder: (context, state) => const ProjectsPage(),
                routes: <RouteBase>[
                  GoRoute(
                    path: ':opportunityId/participations/:participationId',
                    builder: (context, state) {
                      final deal = state.extra;
                      return FounderDealDetailPage(
                        opportunityId:
                            int.tryParse(
                              state.pathParameters['opportunityId'] ?? '',
                            ) ??
                            -1,
                        participationId:
                            int.tryParse(
                              state.pathParameters['participationId'] ?? '',
                            ) ??
                            -1,
                        title: deal is FounderDeal ? deal.opportunityTitle : '',
                        investorName:
                            deal is FounderDeal ? deal.investorName : '',
                        committedAmount:
                            deal is FounderDeal ? deal.amount : null,
                        currency: deal is FounderDeal ? deal.currency : '',
                        contractId:
                            deal is FounderDeal ? deal.contractId : null,
                      );
                    },
                  ),
                  GoRoute(
                    path: 'new',
                    builder: (context, state) => const ProjectFormPage(),
                  ),
                  GoRoute(
                    path: ':projectId',
                    builder:
                        (context, state) => ProjectOverviewPage(
                          projectId:
                              int.tryParse(
                                state.pathParameters['projectId'] ?? '',
                              ) ??
                              -1,
                        ),
                    routes: <RouteBase>[
                      GoRoute(
                        path: 'edit',
                        builder:
                            (context, state) => ProjectFormPage(
                              projectId:
                                  int.tryParse(
                                    state.pathParameters['projectId'] ?? '',
                                  ) ??
                                  -1,
                            ),
                      ),
                      GoRoute(
                        path: 'opportunities',
                        builder:
                            (context, state) => ProjectOpportunitiesPage(
                              projectId:
                                  int.tryParse(
                                    state.pathParameters['projectId'] ?? '',
                                  ) ??
                                  -1,
                            ),
                        routes: <RouteBase>[
                          GoRoute(
                            path: 'new',
                            builder:
                                (context, state) => OpportunityFormPage(
                                  projectId:
                                      int.tryParse(
                                        state.pathParameters['projectId'] ?? '',
                                      ) ??
                                      -1,
                                ),
                          ),
                          GoRoute(
                            path: ':opportunityId/edit',
                            builder:
                                (context, state) => OpportunityFormPage(
                                  projectId:
                                      int.tryParse(
                                        state.pathParameters['projectId'] ?? '',
                                      ) ??
                                      -1,
                                  opportunityId: int.tryParse(
                                    state.pathParameters['opportunityId'] ?? '',
                                  ),
                                ),
                          ),
                          GoRoute(
                            path: ':opportunityId',
                            builder:
                                (
                                  context,
                                  state,
                                ) => ProjectOpportunityDetailPage(
                                  projectId:
                                      int.tryParse(
                                        state.pathParameters['projectId'] ?? '',
                                      ) ??
                                      -1,
                                  opportunityId:
                                      int.tryParse(
                                        state.pathParameters['opportunityId'] ??
                                            '',
                                      ) ??
                                      -1,
                                ),
                            routes: <RouteBase>[
                              GoRoute(
                                path: 'requests',
                                builder:
                                    (context, state) => OpportunityRequestsPage(
                                      opportunityId:
                                          int.tryParse(
                                            state.pathParameters['opportunityId'] ??
                                                '',
                                          ) ??
                                          -1,
                                      title:
                                          state.uri.queryParameters['title'] ??
                                          '',
                                    ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      GoRoute(
                        path: 'room',
                        builder:
                            (context, state) => ProjectRoomPage(
                              projectId:
                                  int.tryParse(
                                    state.pathParameters['projectId'] ?? '',
                                  ) ??
                                  -1,
                            ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/deals',
                builder: (context, state) => const DealsPage(),
                routes: <RouteBase>[
                  GoRoute(
                    path: ':contractId',
                    builder:
                        (context, state) => ContractDetailPage(
                          contractId:
                              int.tryParse(
                                state.pathParameters['contractId'] ?? '',
                              ) ??
                              -1,
                        ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/chat',
                builder: (context, state) => const ChatPage(),
                routes: <RouteBase>[
                  GoRoute(
                    path: ':conversationId',
                    builder: (context, state) {
                      final conversationId =
                          state.pathParameters['conversationId'] ?? '';
                      final extra = state.extra;
                      return ConversationPage(
                        conversation:
                            extra is FounderConversation
                                ? extra
                                : FounderConversation(
                                  id: conversationId,
                                  opportunityId: 0,
                                  opportunityTitle: '',
                                  counterpartyName: '',
                                  counterpartyRole: '',
                                  status: '',
                                  unreadCount: 0,
                                  updatedAt: null,
                                ),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsPage(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfilePage(),
      ),
    ],
  );

  ref.listen(sessionControllerProvider, (_, _) => router.refresh());
  ref.onDispose(router.dispose);
  return router;
});
